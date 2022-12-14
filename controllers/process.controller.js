const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const utils = require('../utils');

module.exports = async function processController ({frames, downloadedFilePath, filename}, token) {
  const proccessedFilePath = path.join(__dirname, '../tmp', filename + '_processed_.mp4');
  const command = `ffmpeg -i "${downloadedFilePath}" -c:v libx264 -preset veryfast -crf 23 -c:a copy -movflags faststart -y -stats -v error "${proccessedFilePath}"`;
  const isNotProccessed = !fs.existsSync(proccessedFilePath);

  if (isNotProccessed) {
    await ffmpegProcess(command, (output) => {
      const progress = parseFfmpegOutput(output);
      utils.stdoutProgress(progress.frame, frames);
    });
  }

  return proccessedFilePath;
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
