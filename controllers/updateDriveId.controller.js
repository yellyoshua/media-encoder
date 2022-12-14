const cinemaModel = require('../models/cinema.model');
const OneDrive = require('../lib/onedrive.js');

const client = new OneDrive();

module.exports = async function updateDriveIdController(media, drivePath, token) {
  const newMedia = await client.getItemByPath(drivePath, token.access_token);

  await cinemaModel.findOneAndUpdate({ _id: media._id }, {
    status: 'pending_cleanup',
    onedrive_id: newMedia.id
  });
}