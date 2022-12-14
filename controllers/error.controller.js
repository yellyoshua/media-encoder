const cinemaModel = require('../models/cinema.model');
const errorManager = require('../lib/errorManager');

module.exports = async function errorController (movie) {
  await errorManager.onInterruptMovie(movie, cinemaModel);
}