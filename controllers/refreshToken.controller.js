const {refreshToken} = require('../lib/authentication');
const authModel = require('../models/auth.model');

module.exports = async function refreshTokenController() {
  const previousAuth = await authModel.findOne();

  if (!previousAuth) {
    throw new Error('No previous auth found');
  }

  const newToken = await refreshToken({
    client_id: process.env.ONE_DRIVE_CLIENT_ID,
    client_secret: process.env.ONE_DRIVE_CLIENT_SECRET,
    refresh_token: previousAuth.refresh_token
  });

  await previousAuth.remove();
  await authModel.create(newToken);

  return newToken;
}