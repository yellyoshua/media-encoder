const cinemaModel = require('../models/cinema.model');
module.exports = async function errorController (movie) {
  await cinemaModel.findOneAndUpdate({ _id: movie._id }, { status: 'pending' });
}