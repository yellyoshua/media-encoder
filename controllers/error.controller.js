const cinemaModel = require('../models/cinema.model');
const errorManager = require('../lib/errorManager');
const deleteMediaFiles = require('../lib/deleteMediaFiles');

module.exports = async function errorController (media) {
  await errorManager.onInterruptMedia(media, cinemaModel);
  deleteMediaFiles(media);
  process.exit(1);
}