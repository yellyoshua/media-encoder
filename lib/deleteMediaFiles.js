const fs = require('fs');

module.exports = function deleteMediaFiles (media) {
  if (media.downloadedFilePath && fs.existsSync(media.downloadedFilePath)) {
    fs.unlinkSync(media.downloadedFilePath);
  }

  if (media.proccessedFilePath && fs.existsSync(media.proccessedFilePath)) {
    fs.unlinkSync(media.proccessedFilePath);
  }
}