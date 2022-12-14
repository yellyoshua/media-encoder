const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');
const getMovieInfo = require('../lib/getMovieInfo');
const client = new OneDrive();

module.exports = async function downloadController (movie, token) {
  const downloadedFilePath = path.join(__dirname, '../tmp', movie.filename + '_download_' + movie.ext);
	fs.mkdirSync(path.dirname(downloadedFilePath), { recursive: true });

  const movieInfo = await getMovieInfo(downloadedFilePath);

  if (movieInfo) {
    return compose_movie_info(movieInfo, movie, downloadedFilePath);
  }

  await client.downloadItem(
    movie.prev_onedrive_id,
    downloadedFilePath,
    token.access_token
  );

  const [downloadedMovieInfo] = await Promise.all([
    getMovieInfo(downloadedFilePath),
    cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'processing' })
  ]);

  return compose_movie_info(downloadedMovieInfo, movie, downloadedFilePath);
}

function compose_movie_info (movieInfo, movie, downloadedFilePath) {
  const {duration, frames, size} = movieInfo;
  return { duration, frames, size, downloadedFilePath, filename: movie.filename, ext: movie.ext }; 
}
