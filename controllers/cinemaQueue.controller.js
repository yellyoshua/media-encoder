const cinemaModel = require('../models/cinema.model');

module.exports = async function cinemaQueueController() {
  const movie = await cinemaModel.findOne({ status: 'pending', kind: {$nin: ['serie']} }, null, {lean: true});
  if (!movie) {
    throw new Error('No pending movies found');
  }

  return movie;
}