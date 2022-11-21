const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const exec = require('child_process').exec;
const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');

const client = new OneDrive();

module.exports = async function processController () {
	const movie = await cinemaModel.findOne({ status: 'pending' }, null, {lean: true});
	if (!movie) return;

	try {
		handleOnSigint(movie);

		logMovieStep(movie, '1. Processing');
		const downloadedFilePath = path.join(__dirname, '../tmp', 'movie' + movie.ext);
		fs.mkdirSync(path.dirname(downloadedFilePath), { recursive: true });

		if (!fs.existsSync(downloadedFilePath)) {
			logMovieStep(movie, '1.1 Downloading');

			await client.downloadItem(
				movie.prev_onedrive_id,
				downloadedFilePath,
				stdoutProgress,
				1000
			);
			logMovieStep(movie, '1.2 Downloaded');
		}

		logMovieStep(movie, '2. Converting');

		const [movieStats] = await Promise.all([
			getMovieFileStats(downloadedFilePath),
			cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'processing' })
		]);

		const proccessedFilePath = path.join(__dirname, '../tmp', `${movie.filename}.mp4`);
		const command = `ffmpeg -i "${downloadedFilePath}" -c:v libx264 -preset veryfast -crf 23 -c:a copy -movflags faststart -y -stats -v error "${proccessedFilePath}"`;

		await ffmpegProcess(command, (output) => {
			const progress = parseFfmpegOutput(output);
			stdoutProgress(progress.frame, movieStats.frames);
		});

		logMovieStep(movie, '3. Converted');
		logMovieStep(movie, '4. Uploading');

		const newMovieDrivePath = path.join('/Temporal', `${movie.filename}${movie.ext}`);

		await client.uploadItem(
			newMovieDrivePath,
			movie.filename + movie.ext,
			proccessedFilePath,
			stdoutProgress
		)

		logMovieStep(movie, '5. Uploaded');
		logMovieStep(movie, '6. Updating');

		const newMovie = await client.getItemByPath(newMovieDrivePath);
		await cinemaModel.findOneAndUpdate({ _id: movie._id }, {
			status: 'pending_cleanup',
			onedrive_id: newMovie.id
		});

		logMovieStep(movie, '7. Updated');
		logMovieStep(movie, '8. Done');
	} catch (error) {
 		console.log('error :', error);
		await cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'pending' });
	}
}

function logMovieStep(movie, step) {
	console.log(`${step} movie: (${movie._id}) - ${movie.title}`);
}

function stdoutProgress(current, remaining) {
	const progress = current / remaining;
	const progressPercent = Math.round(progress * 10000) / 100;

	process.stdout.clearLine(0);
	process.stdout.write(`\r${progressPercent}%`);
	return progressPercent;
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

function handleOnSigint(movie) {
	process.on('SIGINT', async function() {
		console.log("\nCaught interrupt signal");
		await cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'pending' });
		console.log('Movie status updated to pending: ', movie.title);
		process.exit();
	});
}