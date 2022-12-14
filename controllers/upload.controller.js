const path = require('path');
const OneDrive = require('../lib/onedrive.js');

const client = new OneDrive();

module.exports = async function uploadController(media, token) {
  const mediaFileName = media.filename + '.mp4';
  const newMediaDrivePath = generateDrivePath(media, mediaFileName, '/movies-server/media');

  await client.uploadItem(
    filePathEncode(newMediaDrivePath),
    mediaFileName,
    media.proccessedFilePath,
    token.access_token
  );

  return newMediaDrivePath;
}

function generateDrivePath(media, mediaFileName, parentPath) {
  if (media.kind === 'serie') {
    return path.join(parentPath, media.serie, media.season, mediaFileName);
  }

  return path.join(parentPath, media.title, mediaFileName);
}

function filePathEncode(filePath) {
  return encodeURIComponent(filePath).replace(/%2F/g, '/');
}
