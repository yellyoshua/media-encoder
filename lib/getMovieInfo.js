const fs = require('fs');
const exec = require('child_process').exec;

module.exports = async function getMovieInfo(movieFilePath) {
  const existsMovie = fs.existsSync(movieFilePath);
  if (existsMovie) {
    const [duration, size, frames] = await Promise.all([
      getMovieFileDuration(movieFilePath),
      getMovieFileSize(movieFilePath),
      getMovieFileFrames(movieFilePath)
    ]);
  
    return {duration, size, frames};
  }

  return null;
}

async function getMovieFileDuration(movieFilePath) {
	const command = `ffprobe -i "${movieFilePath}" -v quiet -show_entries format=duration -hide_banner -of default=noprint_wrappers=1:nokey=1`;
	const duration = await commandProcess(command);
	return Number(duration);
}

async function getMovieFileSize(movieFilePath) {
	const command = `du -b "${movieFilePath}" | cut -f1`;
	const size = await commandProcess(command);
	const sizeInMb = Math.round(Number(size) / 1000000);
	return sizeInMb;
}

async function getMovieFileFrames(movieFilePath) {
  let frames = 0;

  if (movieFilePath.includes('.mkv')) {
    frames = await getMovieFileFramesMkv(movieFilePath);
  }

  if (movieFilePath.includes('.mp4')) {
    frames = await getMovieFileFramesMp4(movieFilePath);
  }

  return frames;
}

async function getMovieFileFramesMkv(movieFilePath) {
  const command = `mkvinfo "${movieFilePath}" | grep -i "track number" | wc -l`;
  const frames = await commandProcess(command);
  return Number(frames);
}

async function getMovieFileFramesMp4(movieFilePath) {
  const command = `ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=nokey=1:noprint_wrappers=1 "${movieFilePath}"`;
  const frames = await commandProcess(command);
  return Number(frames);
}

function commandProcess(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout);
			}
		});
	});
}