const axios = require('axios').default;
const fs = require('fs');

module.exports = function uploadFile (movie_path, method) {
  const movie = fs.createReadStream(movie_path, { highWaterMark: 1024 * 1024 * 10, encoding: 'utf8' });
  const file = {
    content: movie,
    uploadUrl: 'https://graph.microsoft.com/v1.0/me/drive/root:/Movies/1.mp4:/content',
    name: '1.mp4'
  }

  return axios.put(file.uploadUrl, file.content, {
    onUploadProgress: (progressEvent) => {
    }
  })
}