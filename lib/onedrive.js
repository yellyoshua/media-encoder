const _ = require('underscore');
const fs = require('fs');
const fetch = require('node-fetch').default;
const FormData = require('form-data')

module.exports = class Onedrive {
	constructor() {}

	async getItem (itemId) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/items/${itemId}`,
				method: 'GET'
			}
		);

		const data = await response.json();

		return sanitizeItem(data);
	}

	async getItemByPath (itemPath) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/root:${itemPath}`,
				method: 'GET'
			}
		);

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error.code);
		}

		return sanitizeItem(data);
	}

	async getFolderItems (folderId) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/items/${folderId}/children`,
				method: 'GET'
			}
		);

		const data = await response.json();
		if (data.error) {
			throw new Error(data.error.code);
		}

		return _(data.value).map(sanitizeItem);
	}

	async downloadItem (itemId, destination, progressCallback = null, progressInterval = 1000) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/items/${itemId}/content`,
				method: 'GET'
			}
		);

		const fileStream = fs.createWriteStream(destination);

		response.body.pipe(fileStream);
		// Get stream progress each 1s
		const totalSize = response.headers.get('content-length');
		let downloaded = 0;

		response.body.on('data', (chunk) => {
			downloaded += chunk.length;
		});

		const interval = setInterval(() => {
			if (typeof progressCallback === 'function') {
				progressCallback(downloaded, totalSize);
			}
		}, progressInterval);

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

	async #createUploadSession (itemDestinationPath, fileName) {
		const response = await requestOneDrive({
			path: `/me/drive/root:${itemDestinationPath}:/createUploadSession`,
			method: 'POST',
			body: JSON.stringify({
				item: {
					'@microsoft.graph.conflictBehavior': 'rename',
					name: fileName
				}
			})
		});

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error.code);
		}

		return data.uploadUrl;
	}

	async uploadItem (itemDestinationPath, fileName, filePath, progressCallback) {
		const uploadSession = await this.#createUploadSession(itemDestinationPath, fileName);

		const fileStream = fs.createReadStream(filePath, {encoding: 'binary'});
		const totalSize = fs.statSync(filePath).size;
		let uploaded = 0;

		const formData = new FormData();
		formData.append('Content-Type', 'application/octet-stream');
		formData.append('file', fileStream);

		const interval = setInterval(() => {
			if (typeof progressCallback === 'function') {
				progressCallback(uploaded, totalSize);
			}
		}, 1000);

		formData.on('data', (chunk) => {
			uploaded += chunk.length;
		});

		const response = await fetch(uploadSession, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/octet-stream'
			},
			body: formData
		});

		const data = await response.text();
		const json = safeParseJSON(data);

		clearInterval(interval);
		if (json.error) {
			throw new Error(data.error.code);
		}
	}

	async deleteItem (itemId) {
		const response = await requestOneDrive(
			{
				path: `/me/drive/items/${itemId}`,
				method: 'DELETE'
			}
		);

		const data = await response.json();

		if (data.error) {
			throw new Error(data.error.code);
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

function requestOneDrive({path, method, body}) {
	const endpoint = 'https://graph.microsoft.com/v1.0';
	const authorization = `Bearer ${process.env.ONEDRIVE_AUTHORIZATION_TOKEN}`;

	return fetch(`${endpoint}${path}`, {
		method,
		headers: {
			Authorization: authorization,
			'Content-Type': 'application/json',
		},
		body,
	});
}