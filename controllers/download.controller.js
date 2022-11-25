const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');
const client = new OneDrive();

module.exports = async function downloadController (movie, token) {
  const downloaded_file_path = path.join(__dirname, '../tmp', 'movie' + movie.ext);
	fs.mkdirSync(path.dirname(downloaded_file_path), { recursive: true });

  if (!fs.existsSync(downloaded_file_path)) {
    await client.downloadItem(
      movie.prev_onedrive_id,
      downloaded_file_path,
      token.access_token
    );
  }

  const [movieStats] = await Promise.all([
    getMovieFileStats(downloaded_file_path),
    cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'processing' })
  ]);

  const {duration, frames, size} = movieStats;

  return { duration, frames, size, downloaded_file_path, filename: movie.filename };
}

async function getMovieFileStats(movieFilePath) {
	const [duration, size, frames] = await Promise.all([
		getMovieFileDuration(movieFilePath),
		getMovieFileSize(movieFilePath),
		getMovieFileFrames(movieFilePath)
	]);

	return {duration, size, frames};
}

async function getMovieFileDuration(movieFilePath) {
	const command = `ffprobe -i ${movieFilePath} -v quiet -show_entries format=duration -hide_banner -of default=noprint_wrappers=1:nokey=1`;
	const duration = await commandProcess(command);
	return Number(duration);
}

async function getMovieFileSize(movieFilePath) {
	const command = `du -b ${movieFilePath} | cut -f1`;
	const size = await commandProcess(command);
	const sizeInMb = Math.round(Number(size) / 1000000);
	return sizeInMb;
}

async function getMovieFileFrames(movieFilePath) {
	const command = `ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=nokey=1:noprint_wrappers=1 ${movieFilePath}`;
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
