const _ = require('underscore');
const fs = require('fs');
const fetch = require('node-fetch').default;
const FormData = require('form-data');
const utils = require('../utils');

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
			utils.stdoutProgress(downloaded, totalSize);
		}, 1000);

		return new Promise((resolve, reject) => {
			fileStream.on('finish', () => {
				clearInterval(interval);
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

		if (data.error) {
			throw new Error(data.error);
		}

		return data.uploadUrl;
	}

	async uploadItem (destinationPath, fileName, filePath, access_token) {
		const uploadSession = await this.#createUploadSession(destinationPath, fileName, access_token);

		const fileStream = fs.createReadStream(filePath, {encoding: 'binary'});
		const totalSize = fs.statSync(filePath).size;
		let uploaded = 0;

		const formData = new FormData();
		formData.append('file', fileStream);

		const interval = setInterval(() => {
      utils.stdoutProgress(uploaded, totalSize);
		}, 1000);

		formData.on('data', (chunk) => {
			uploaded += chunk.length;
		});

		const response = await fetch(uploadSession, {
			method: 'PUT',
			headers: {
				'Content-Type': 'text/plain',
        'Content-Range': `bytes 0-${totalSize - 1}/${totalSize}`,
        'Content-Length': totalSize
			},
			body: formData
		});

		const data = await response.text();
		const json = safeParseJSON(data);

		clearInterval(interval);
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