const express = require('express');
const fetch = require('node-fetch').default;
const app = express();

module.exports = {
  claimOneDriveToken: async ({client_id, client_secret, port = 3000} = {}) => {
    const redirect_uri = `http://localhost:${port}/redirect`;
    const authData = {client_id, client_secret, port, redirect_uri};

    const authUrl = getAuthUrl(authData);
    console.log(`Visit \n\n${authUrl}\n\nTo authorize this app to access your OneDrive account.`);

    const response = await claimTokenHandler(authData);
    await response.listener.close();

    const {access_token, refresh_token} = response.response;
    return {access_token, refresh_token};
  },
  refreshToken: async ({client_id, client_secret, refresh_token} = {}) => {
    const params = {
      client_id: client_id,
      client_secret: client_secret,
      refresh_token: refresh_token,
      grant_type: 'refresh_token',
    };

    const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      body: new URLSearchParams(params),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    const {access_token, refresh_token: new_refresh_token} = data;
    return {access_token, refresh_token: new_refresh_token};
  }
}

function getAuthUrl({client_id, redirect_uri}) {
  const params = {
    client_id: client_id,
    redirect_uri: redirect_uri,
    response_type: 'code',
    response_mode: 'query',
    scope: 'offline_access Files.ReadWrite.All',
  };

  const url = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  url.search = new URLSearchParams(params);
  return url;
}

function claimTokenHandler({port, ...authData}) {
  return new Promise((resolve, reject) => {
    const listener = app.listen(port);

    app.get('/redirect', async (req, res) => {
      const code = req.query.code;
      const response = await getToken(authData, code);
      res.send('Check the console');
      if (response.error) {
        reject(response.error);
      } else {
        resolve({listener, response});
      }
    });
  });
}

async function getToken({client_id, client_secret, redirect_uri}, code) {
  const params = {
    client_id: client_id,
    redirect_uri: redirect_uri,
    client_secret: client_secret,
    code: code,
    grant_type: 'authorization_code',
  };

  const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    body: new URLSearchParams(params),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.json();
}