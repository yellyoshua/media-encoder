const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');

const client = new OneDrive();

module.exports = async function uploadController(movie, proccessedFilePath, token) {
  const newMovieDrivePath = path.join('/Temporal', `${movie.filename}${movie.ext}`);

  await client.uploadItem(
    newMovieDrivePath,
    movie.filename + movie.ext,
    proccessedFilePath,
    token.access_token
  );

  return newMovieDrivePath;
}
