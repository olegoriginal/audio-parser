const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const uuid = require("uuid");
const https = require("https");
const path = require("path");
const express = require("express"); // import express js library
const app = express();
const request = require("request");
const download = require("image-downloader");
const imageDownloader = require('node-image-downloader')

declare module download {
  image(options: Options): Promise<{ filename: string }>;
}

const urlMain = "https://audio-master.net";

async function takeCategories() {
  return new Promise((resolve) => {
    axios.get(urlMain).then((res) => {
      const categories = [];
      const $ = cheerio.load(res.data);
      const get = $(".category").each((index, element) => {
        const title = $(element)
          .children("div")
          .children("h2")
          .children("a")
          .attr("title");
        const link = $(element)
          .children("div")
          .children("h2")
          .children("a")
          .attr("href");
        const imageFile = $(element)
          .children("div")
          .children("h2")
          .children("a")
          .children("img")
          .attr("src");
        categories[index] = {
          title,
          link: link,
          fulllink: urlMain + link,
          parrentCategory: "none",
          imageLink: urlMain + imageFile,
          image: imageFile.split("/").slice(-1)[0],
        };
        const options = {
          url: "http://img.crazys.info/files/i/2011.2.13/1297564811_w25.jpg",
          dest: "/img/tt", // will be saved to /path/to/dest/image.jpg
        };
        download
          .image(options)
          .then(({ filename }) => {
            console.log("Saved to", filename); // saved to /path/to/dest/image.jpg
          })
          .catch((err) => console.error(err));
      });
      fs.writeFile(
        "json/categories.json",
        JSON.stringify(categories),
        (err) => {
          if (err) console.log(err);
          else {
            console.log("File catgories written successfully\n");
          }
        }
      );
      resolve(categories);
      console.log(categories);
    });
  });
}

takeCategories();
// git test

app.listen(8000, () => {
  console.log(`application is running at: http://localhost:8000`);
});
