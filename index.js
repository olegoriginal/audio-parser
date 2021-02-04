const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const uuid = require("uuid");

const url = "https://audio-master.net";

async function takeCategories() {
  return new Promise((resolve) => {
    axios.get(url).then((res) => {
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
        const image = $(element)
          .children("div")
          .children("h2")
          .children("a")
          .children("img")
          .attr("src");
        categories[index] = {
          title,
          link: link,
          fulllink: url + link,
          parrentCategory: "none",
          imageLink: url + image,
          image: image.split("/").slice(-1)[0],
        };
        fs.writeFile(
          `img/${image.split("/").slice(-1)[0]}`,
          url && link,
          (err) => {
            if (err) console.log(err);
            else {
              console.log("Image written successfully\n");
            }
          }
        );
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
