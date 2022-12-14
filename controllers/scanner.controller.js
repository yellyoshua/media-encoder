const fs = require('fs');
const _ = require('underscore');
const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');
const driveItem = require('../lib/driveItem.js');
const getFilenameInfo = require('../lib/getFilenameInfo');

const moviesPathId = [
  '24F25D0D0E6CE181!11538',
  '24F25D0D0E6CE181!14163'
];

const seriesPathId = [
  '24F25D0D0E6CE181!11537'
];

const client = new OneDrive();

module.exports = async function scannerController(token) {
  const movies = await scanMovies(token);
  const series = await scanSeries(token);

  const mediaFiles = _(movies).union(series);

	const mediaFilesAlreadyInDb = await cinemaModel.find({
    prev_onedrive_id: { $in: _(mediaFiles).pluck('id') }
	}, null, {lean: true});

	const mediaFilesToInsert = _(mediaFiles).filter((media) => {
		const mediaAlreadyInDb = _(mediaFilesAlreadyInDb).findWhere({ prev_onedrive_id: media.id });
		return !mediaAlreadyInDb;
	});

	const promises = _(mediaFilesToInsert).map((media) => {
    const {extension, quality, title} = getFilenameInfo(media.title);

		const newMedia = new cinemaModel({
			title: media.title,
			prev_onedrive_id: media.id,
			filename: title,
			filehash: media.filehash,
      serie: media.serie,
      season: media.season,
      kind: media.kind,
			ext: extension,
			quality: quality,
			status: 'pending'
		});

		return newMedia.save();
	});

	await Promise.all(promises);
}

async function scanMovies(token) {
  const promises = _(moviesPathId).map((pathId) => {
    return client.getFolderItems(pathId, token.access_token);
  });

  const mediaLists = await Promise.all(promises);

  const mediaFiles = _(mediaLists).flatten();
  const taggedMedia = tagMedia(mediaFiles, 'movie');

  return driveItem.filterVideoFiles(taggedMedia);
}

async function scanSeries(token) {
  const promises = _(seriesPathId).map(async (pathId) => {
    const seriesList = await client.getFolderItems(pathId, token.access_token);

    const seriesWithSeasons = await Promise.all(_(seriesList).map(async (serie) => {
      const seasons = await client.getFolderItems(serie.id, token.access_token);

      const seasonsWithEpisodes = await Promise.all(_(seasons).map(async (season) => {
        const episodes = await client.getFolderItems(season.id, token.access_token);

        return _(episodes).map((episode) => {
          return {
            ...episode,
            serie: serie.title,
            season: season.title,
          };
        });
      }));

      return _(seasonsWithEpisodes).flatten();
    }));

    return _(seriesWithSeasons).flatten();
  });

  const mediaLists = await Promise.all(promises);

  const mediaFiles = _(mediaLists).flatten();
  const taggedMedia = tagMedia(mediaFiles, 'serie');

  return driveItem.filterVideoFiles(taggedMedia);
}

function tagMedia(mediaFiles, tag) {
  return _(mediaFiles).map((mediaFile) => {
    return _(mediaFile).extend({ kind: tag});
  });
}