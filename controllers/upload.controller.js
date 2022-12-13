const path = require('path');
const OneDrive = require('../lib/onedrive.js');

const client = new OneDrive();

module.exports = async function uploadController(movie, token) {
  const movieFileName = movie.filename + movie.ext;
  const newMovieDrivePath = path.join('/Temporal', movieFileName);

  await client.uploadItem(
    newMovieDrivePath,
    movieFileName,
    movie.proccessedFilePath,
    token.access_token
  );

  return newMovieDrivePath;
}
