const axios = require('axios').default;
const fs = require('fs');

const partSplit = 6;

module.exports = async function uploadFile (uploadUrl, mediaPath, partIndex = 0) {
  const totalSize = fs.statSync(mediaPath).size;

  const isLastPart = partIndex === partSplit - 1;

  process.stdout.clearLine(0);
  process.stdout.write(`${25 * partIndex}%\r`);

  const partSize = Math.ceil(totalSize / partSplit);
  const partStart = partIndex * partSize;
  const partEnd = isLastPart 
    ? totalSize - 1
    : (partStart + partSize) - 1;

  const headers = {
    'Content-Type': 'text/plain',
    'Content-Range': `bytes ${partStart}-${partEnd}/${totalSize}`,
    'Content-Length': partEnd - partStart + 1
  };

  const file = fs.createReadStream(mediaPath);
  const response = await axios.put(uploadUrl, file, { headers });
  const nextExpectedRanges = response.data?.nextExpectedRanges?.[0];
  if (nextExpectedRanges) {
    return uploadFile(uploadUrl, mediaPath, partIndex + 1);
  }

  return response.data;
}