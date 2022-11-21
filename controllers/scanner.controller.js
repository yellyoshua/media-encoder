const _ = require('underscore');
const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');
const driveItem = require('../lib/driveItem.js');

const client = new OneDrive();

module.exports = async function scannerController() {
	const [movies_folder, new_movies_folder] = await Promise.all([
		client.getFolderItems('24F25D0D0E6CE181!11538'),
		client.getFolderItems('24F25D0D0E6CE181!14163')
	]);

	const movies = driveItem.onlyVideoFiles(
		_(movies_folder).union(new_movies_folder)
	);

	const moviesAlreadyInDb = await cinemaModel.find({
		prev_onedrive_id: { $in: _(movies).pluck('id') }
	}, null, {lean: true});

	const moviesToInsert = _(movies).filter((movie) => {
		const movieAlreadyInDb = _(moviesAlreadyInDb).findWhere({ prev_onedrive_id: movie.id });
		return !movieAlreadyInDb;
	});

	const promises = _(moviesToInsert).map((movie) => {
		const newMovie = new cinemaModel({
			title: movie.title,
			prev_onedrive_id: movie.id,
			filename: parse_title(movie.title),
			filehash: movie.filehash,
			ext: get_extension(movie.title),
			quality: get_quality(movie.title),
			status: 'pending'
		});

		return newMovie.save();
	});

	await Promise.all(promises);
}

function parse_title (filename) {
	const to_lower = filename.toLowerCase();
	const witout_extension = to_lower.replace(/\.[^/.]+$/, '');
	const without_underscore = witout_extension.replace(/_/g, ' ');
	const witout_quality_p = without_underscore.replace(/(1080p|720p|480p|360p)/, ' ');
	const witout_quality = witout_quality_p.replace(/(1080|720|480|360)/, ' ');
	const witout_slashes = witout_quality.replace(/\//g, ' ');
	const witout_dots = witout_slashes.replace(/\./g, ' ');
	const witout_minus = witout_dots.replace(/-/g, ' ');
	const witout_brands = witout_minus.replace(/(@streaminglatino)/, ' ');
	const witout_language = witout_brands.replace(/(latino|español|espanol|subtitulado)/, ' ');
	const witout_spaces = witout_language.replace(/\s+/g, '_');
	const witout_last_underscore = witout_spaces.replace(/_$/, '');
	return witout_last_underscore;
}

function get_extension (filename) {
	const extension = filename.match(/(\.[a-z0-9]+)$/);
	return extension ? extension[0] : null;
}

function get_quality (filename) {
	const quality_p = filename.match(/(1080p|720p|480p|360p)/);
	const quality = filename.match(/(1080|720|480|360)/);
	return quality_p
		? quality_p[0]
		: quality
		? quality[0]
		: null;
}
