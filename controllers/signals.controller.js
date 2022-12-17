const cinemaModel = require('../models/cinema.model');
const errorManager = require('../lib/errorManager');
const deleteMediaFiles = require('../lib/deleteMediaFiles');

module.exports = function signalsController(media) {
  process.removeAllListeners('SIGINT');
  process.on('SIGINT', async function() {
		console.log("\nCaught interrupt signal");
    await errorManager.onInterruptMedia(media, cinemaModel);
    deleteMediaFiles(media);
		process.exit(1);
	});
}
