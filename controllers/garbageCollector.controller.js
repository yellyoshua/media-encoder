const fs = require('fs');
const _ = require('underscore');
const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');
const deleteMediaFiles = require('../lib/deleteMediaFiles');

const client = new OneDrive();

const enableCleanup = false;

module.exports = async function garbageCollector(mediaInfo, token) {
	const mediaList = await cinemaModel.find({ status: 'pending_cleanup' }, null, {lean: true});
  deleteMediaFiles(mediaInfo);

	const promises = _(mediaList).map(async (media) => {
		try {
			if (enableCleanup) {
				await cinemaModel.findOneAndUpdate({ _id: media._id }, { status: 'cleaning' });
				await client.deleteItem(media.prev_onedrive_id, token.access_token);
				await cinemaModel.findOneAndUpdate({ _id: media._id }, { status: 'done' });
			}
		} catch (err) {
			await cinemaModel.findOneAndUpdate({ _id: media._id }, { status: 'pending_cleanup' });
			console.log(err);
		}
	});

	await Promise.all(promises);
}
