const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const utils = require('./index');

const outputParsers = {
  ffmpeg: (rawOutput = '', total = 0) => {
    if (rawOutput.trim()) {
      const progress = parseFfmpegOutput(rawOutput);
      return {current: progress.frame, remaining: total};
    }
  }
};

module.exports = function execute (command, executeKind, config = {}) {
  const outputParser = outputParsers[executeKind];

  const progressFunc = config.progressCount
    ? utils.progressCount
    : utils.progressPercent;

	return new Promise((resolve, reject) => {
		const process = exec(command);
		let output = {};
		
		const intervalId = setInterval(() => {
			if (output.current && output.remaining) {
        progressFunc(output.current, output.remaining);
			}
		}, config.interval || 1000);

		process.stderr.on('data', function(data) {
			output = outputParser(data, config.total);
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
