const path = require('path');
const exec = require('child_process').exec;
const utils = require('../utils');
const getMovieInfo = require('../lib/getMovieInfo');

module.exports = async function processController ({frames, downloaded_file_path, filename}, token) {
  const proccessedFilePath = path.join(__dirname, '../tmp', `${filename}.mp4`);
  const isNotProccessed = await compareMovieInfo(downloaded_file_path, proccessedFilePath);
  const command = `ffmpeg -i "${downloaded_file_path}" -c:v libx264 -preset veryfast -crf 23 -c:a copy -movflags faststart -y -stats -v error "${proccessedFilePath}"`;

  if (isNotProccessed) {
    await ffmpegProcess(command, (output) => {
      const progress = parseFfmpegOutput(output);
      utils.stdoutProgress(progress.frame, frames);
    });
  }

  return proccessedFilePath;
}

async function compareMovieInfo(downloadedMoviePath, proccessedMoviePath) {
  const downloadedMovieInfo = await getMovieInfo(downloadedMoviePath);
  const proccessedMovieInfo = await getMovieInfo(proccessedMoviePath);
  const isDurationEqual = equalWithoutDecimal(downloadedMovieInfo?.duration, proccessedMovieInfo?.duration);
  return !isDurationEqual;
}

function equalWithoutDecimal(number1, number2) {
  const number1WithoutDecimal = String(number1).split('.')[0];
  const number2WithoutDecimal = String(number2).split('.')[0];
  return number1WithoutDecimal === number2WithoutDecimal;
}

function ffmpegProcess(command, progressCallback, interval = 1000) {
	return new Promise((resolve, reject) => {
		const process = exec(command);
		let output = '';
		
		const intervalId = setInterval(() => {
			if (typeof progressCallback === 'function' && output.trim()) {
				progressCallback(output);
			}
		}, interval);

		process.stderr.on('data', function(data) {
			output = data;
		});

		process.on('close', function(code) {
			clearInterval(intervalId);
			resolve();
		});

		process.on('error', function(err) {
			clearInterval(intervalId);
			reject(err);
		});
	});
}

function parseFfmpegOutput(output) {
	const frame = Number(output.match(/frame=\s*(\d+)/)[1]);
	const fps = output.match(/fps=\s*(\d+)/)[1];
	const size = output.match(/size=\s*(\d+)/)[1];
	const time = output.match(/time=\s*(\d+)/)[1];
	const speed = output.match(/speed=\s*(\d+)/)[1];

	return { frame, fps, size, time, speed };
}
