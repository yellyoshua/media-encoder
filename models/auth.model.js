const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
  refresh_token: {
    type: String,
    required: true
  },
  access_token: {
    type: String,
    required: true
  }
}, { timestamps: true, collection: 'auth' });

authSchema.index({ refresh_token: 1, access_token: 1 }, { unique: true, name: 'unique_auth' });

module.exports = mongoose.model('auth', authSchema);