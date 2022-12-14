require('dotenv').config();
const _ = require('underscore');
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

  const media = await cinemaQueueController();
  signalsController(media);

  try {
    logStep('Starting processing', media, true);

    logStep('Downloading', media);
    token = await refreshTokenController();
    const mediaInfo = await downloadController(media, token);

    _(media).extend(mediaInfo);

    logStep('Processing', media);
    token = await refreshTokenController();
    media.proccessedFilePath = await processController(media, token);

    logStep('Uploading', media);
    token = await refreshTokenController();
    const drivePath = await uploadController(media, token);

    logStep('Updating drive id', media);
    token = await refreshTokenController();
    await updateDriveIdController(media, drivePath, token);

    logStep('Cleaning up', media);
    token = await refreshTokenController();
    await garbageCollectorController(media, token);

    logStep('Done', media);

    if (command === 'batch') {
      console.log('');
      console.log('----------------------------------------')
      console.log('---- Starting next batch processing ----')
      console.log('----------------------------------------')
      return app();
    }

    return process.exit(0);
  } catch (e) {
    logStep('Error', media);
    console.error(e);
    await errorController(media);

    return process.exit(1);
  }
}

function logStep(step, media, show_title = false) {
  if (media) {
    console.log(`\n${step} ${media.kind}: (${media._id}) ${show_title ? `- ${media.title}` : '' }`);
    return;
  }

  console.log(`\n${step}`);
}

app()
.catch((err) => {
	console.error(err);
	process.exit(1);
});