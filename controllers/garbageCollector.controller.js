const _ = require('underscore');
const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');

const client = new OneDrive();

const enableCleanup = false;

module.exports = async function garbageCollector(token) {
	const movies = await cinemaModel.find({ status: 'pending_cleanup' }, null, {lean: true});

	const promises = _(movies).map(async (movie) => {
		try {
			if (enableCleanup) {
				await cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'cleaning' });
				await client.deleteItem(movie.prev_onedrive_id, token.access_token);
				await cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'done' });
			}
		} catch (err) {
			await cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'pending_cleanup' });
			console.log(err);
		}
	});

	await Promise.all(promises);
}
