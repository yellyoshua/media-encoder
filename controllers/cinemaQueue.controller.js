const _ = require('underscore');
const cinemaModel = require('../models/cinema.model');

module.exports = async function cinemaQueueController() {
  const mediaQueue = await cinemaModel.find({ status: 'pending' }, null, {lean: true});
  if (mediaQueue.length === 0) {
    throw new Error('No pending media queue');
  }

  const pending = mediaQueue.length - 1;
  const media = _(mediaQueue).first();

  return { media, pending };
}