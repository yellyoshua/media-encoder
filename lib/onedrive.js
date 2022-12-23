const _ = require('underscore');
const fs = require('fs');
const axios = require('axios').default;
const fetch = require('node-fetch').default;
const FormData = require('form-data');
const utils = require('../utils');
const uploadFile = require('../utils/uploadFile');

module.exports = class Onedrive {
  constructor() {}

	async getItem (itemId, access_token) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/items/${itemId}`,
				method: 'GET'
			}, access_token);

		const data = await response.json();

		return sanitizeItem(data);
	}

	async getItemByPath (itemPath, access_token) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/root:${itemPath}`,
				method: 'GET'
			}, access_token);

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error.code);
		}

		return sanitizeItem(data);
	}

	async getFolderItems (folderId, access_token) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/items/${folderId}/children`,
				method: 'GET'
			}, access_token);

		const data = await response.json();
		if (data.error) {
			throw new Error(data.error);
		}

		return _(data.value).map(sanitizeItem);
	}

	async downloadItem (itemId, destination, access_token) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/items/${itemId}/content`,
				method: 'GET'
			}, access_token);

		const fileStream = fs.createWriteStream(destination);

		response.body.pipe(fileStream);
		// Get stream progress each 1s
		const totalSize = response.headers.get('content-length');
		let downloaded = 0;

		response.body.on('data', (chunk) => {
			downloaded += chunk.length;
		});

		const interval = setInterval(() => {
			utils.progressPercent(downloaded, totalSize);
		}, 1000);

		return new Promise((resolve, reject) => {
			fileStream.on('finish', () => {
				clearInterval(interval);
        utils.progress(100);
				resolve();
			});
			fileStream.on('error', (err) => {
				clearInterval(interval);
				reject(err);
			});
		});
	}

	async #createUploadSession (itemDestinationPath, fileName, access_token) {
		const response = await requestOneDrive({
			path: `/me/drive/root:${itemDestinationPath}:/createUploadSession`,
			method: 'POST',
			body: JSON.stringify({
				item: {
					'@microsoft.graph.conflictBehavior': 'replace',
					name: fileName
				}
			})
		}, access_token);

		const data = await response.json();

    const uploadUrl = data.uploadUrl;

    await requestOneDrive({
      path: `/me/drive/root:${itemDestinationPath}`,
      method: 'PUT',
      body: JSON.stringify({
        name: fileName,
        '@microsoft.graph.sourceUrl': uploadUrl
      })
    }, access_token);

		if (data.error) {
			throw new Error(data.error);
		}

		return data.uploadUrl;
	}

	async uploadItem (destinationPath, fileName, filePath, access_token) {
		const uploadSession = await this.#createUploadSession(destinationPath, fileName, access_token);
    const response = await uploadFile(uploadSession, filePath);
		const json = safeParseJSON(response);

		if (json.error) {
			throw new Error(data.error);
		}
	}

	async deleteItem (itemId, access_token) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/items/${itemId}`,
				method: 'DELETE'
			}, access_token);

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error);
		}

		return data;
	}
}

function sanitizeItem(item) {
	return {
		id: item.id,
		title: item.name,
		downloadUrl: item['@microsoft.graph.downloadUrl'],
		size: item.size,
    isFolder: Boolean(item.folder),
		filehash: item.file?.hashes?.sha1Hash,
		filePath: item.parentReference?.path,
		driveId: item.parentReference?.driveId
	};
}

function safeParseJSON (json) {
	try {
		return JSON.parse(json);
	} catch (e) {
		return {};
	}
}

function requestOneDrive({path, method, body}, access_token) {
	const endpoint = 'https://graph.microsoft.com/v1.0';
	const authorization = `Bearer ${access_token}`;

	return fetch(`${endpoint}${path}`, {
		method,
		headers: {
			Authorization: authorization,
			'Content-Type': 'application/json',
		},
		body,
	});
}