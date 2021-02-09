const fs = require("fs");
const https = require("https");

function saveImageToDisk(url, path) {
  const fullUrl = url;
  const localPath = fs.createWriteStream(path);

  const request = https.get(fullUrl, function (response) {
    response.pipe(localPath);
  });
}

module.exports = saveImageToDisk;
