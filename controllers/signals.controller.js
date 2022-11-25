const cinemaModel = require('../models/cinema.model');

module.exports = function signalsController(movie) {
  process.on('SIGINT', async function() {
		console.log("\nCaught interrupt signal");
		await cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'pending' });
		console.log('Movie status updated to pending: ', movie.title);
		process.exit(1);
	});
}
