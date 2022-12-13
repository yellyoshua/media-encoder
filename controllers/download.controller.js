const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');
const getMovieInfo = require('../lib/getMovieInfo');
const client = new OneDrive();

module.exports = async function downloadController (movie, token) {
  const downloaded_file_path = path.join(__dirname, '../tmp', 'movie' + movie.ext);
	fs.mkdirSync(path.dirname(downloaded_file_path), { recursive: true });

  const movieInfo = await getMovieInfo(downloaded_file_path);

  if (movieInfo) {
    return compose_movie_info(movieInfo, movie, downloaded_file_path);
  }

  await client.downloadItem(
    movie.prev_onedrive_id,
    downloaded_file_path,
    token.access_token
  );

  const [downloadedMovieInfo] = await Promise.all([
    getMovieInfo(downloaded_file_path),
    cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'processing' })
  ]);

  return compose_movie_info(downloadedMovieInfo, movie, downloaded_file_path);
}

function compose_movie_info (movieInfo, movie, downloaded_file_path) {
  const {duration, frames, size} = movieInfo;
  return { duration, frames, size, downloaded_file_path, filename: movie.filename, ext: movie.ext }; 
}
