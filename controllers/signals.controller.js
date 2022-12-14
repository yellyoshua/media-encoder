const cinemaModel = require('../models/cinema.model');
const errorManager = require('../lib/errorManager');

module.exports = function signalsController(movie) {
  process.on('SIGINT', async function() {
		console.log("\nCaught interrupt signal");
    await errorManager.onInterruptMovie(movie, cinemaModel);
		process.exit(1);
	});
}
