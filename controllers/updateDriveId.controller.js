const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');

const client = new OneDrive();

module.exports = async function updateDriveIdController(movie, drivePath, token) {
  const newMovie = await client.getItemByPath(drivePath, token.access_token);

  await cinemaModel.findOneAndUpdate({ _id: movie._id }, {
    status: 'pending_cleanup',
    onedrive_id: newMovie.id
  });
}