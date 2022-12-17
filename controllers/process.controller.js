const fs = require('fs');
const path = require('path');
const commands = require('../lib/commands');

module.exports = async function processController ({frames, downloadedFilePath, filename}, token) {
  const proccessedFilePath = path.join(__dirname, '../tmp', filename + '_processed_.mp4');
  const isNotProccessed = !fs.existsSync(proccessedFilePath);

  if (isNotProccessed) {
    await commands.ffmpeg({
      filePath: downloadedFilePath,
      destination: proccessedFilePath,
      frames
    });
  }

  return proccessedFilePath;
}