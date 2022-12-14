require('dotenv').config();
const mongoose = require('mongoose');
const scannerController = require('./controllers/scanner.controller');
const garbageCollectorController = require('./controllers/garbageCollector.controller');
const processController = require('./controllers/process.controller');
const claimTokenController = require('./controllers/claimToken.controller');
const refreshTokenController = require('./controllers/refreshToken.controller');
const cinemaQueueController = require('./controllers/cinemaQueue.controller');
const signalsController = require('./controllers/signals.controller');
const downloadController = require('./controllers/download.controller');
const uploadController = require('./controllers/upload.controller');
const updateDriveIdController = require('./controllers/updateDriveId.controller');
const errorController = require('./controllers/error.controller');
const command = process.argv[2];

async function app () {
	await mongoose.connect(process.env.DATABASE_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

  if (command === 'claimToken') {
    await claimTokenController();
    return process.exit(0);
  }

  let token = await refreshTokenController();

  if (command === 'scan') {
    logStep('Scanning');
    await scannerController(token);
    return process.exit(0);
  }

  const movie = await cinemaQueueController();
  signalsController(movie);

  try {
    logStep('Starting processing', movie, true);

    logStep('Downloading', movie);
    token = await refreshTokenController();
    const movieInfo = await downloadController(movie, token);

    logStep('Processing', movie);
    token = await refreshTokenController();
    movieInfo.proccessedFilePath = await processController(movieInfo, token);

    logStep('Uploading', movie);
    token = await refreshTokenController();
    const drivePath = await uploadController(movieInfo, token);

    logStep('Updating drive id', movie);
    token = await refreshTokenController();
    await updateDriveIdController(movie, drivePath, token);

    logStep('Cleaning up', movie);
    token = await refreshTokenController();
    await garbageCollectorController(movieInfo, token);

    logStep('Done', movie);

    return process.exit(0);
  } catch (e) {
    logStep('Error', movie);
    console.error(e);
    await errorController(movie);

    return process.exit(1);
  }
}

function logStep(step, movie, show_title = false) {
  if (movie) {
    console.log(`\n${step} movie: (${movie._id}) ${show_title ? `- ${movie.title}` : '' }`);
    return;
  }

  console.log(`\n${step}`);
}

app()
.catch((err) => {
	console.error(err);
	process.exit(1);
});