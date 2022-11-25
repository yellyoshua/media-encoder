const {claimOneDriveToken} = require('../lib/authentication');
const authModel = require('../models/auth.model');

module.exports = async function claimTokenController() {
  const token = await claimOneDriveToken({
    client_id: process.env.ONE_DRIVE_CLIENT_ID,
    client_secret: process.env.ONE_DRIVE_CLIENT_SECRET,
    port: 3000
  });

  const previousAuth = await authModel.findOne();
  if (previousAuth) {
    await previousAuth.remove();
  }

  await authModel.create(token);
}
