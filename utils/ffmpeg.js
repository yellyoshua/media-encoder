const execute = require('./execute');

const ffmpegPath = 'ffmpeg';

module.exports = async function ffmpeg(media = {}) {
  const {filePath, destination, frames} = media;
  const command = composeCommand({filePath, destination});

  return execute(command, 'ffmpeg', {total: frames, progressCount: true});
}

function composeCommand(media) {
  const commandParts = [ffmpegPath];
  commandParts.push('-i', `"${media.filePath}"`);
  commandParts.push('-c:v', 'libx264');
  commandParts.push('-preset', 'veryfast');
  commandParts.push('-crf', '23');
  commandParts.push('-c:a', 'copy');
  commandParts.push('-movflags', 'faststart');
  commandParts.push('-y');
  commandParts.push('-stats');
  commandParts.push('-v', 'error');
  commandParts.push(media.destination);

  return commandParts.join(' ');
}
