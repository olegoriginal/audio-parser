const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const uuid = require("uuid");
const path = require("path");
const ID = require("nodejs-unique-numeric-id-generator");
const saveImageToDisk = require("./img");

const url = "https://audio-master.net";

const makeIdGreatAgain = (uri) => {
  let encode = "";
  for (let i = 0; i < uri.length; i++) {
    let x = uri.slice(i, i + 1);
    encode += x.charCodeAt(0);
  }
  return encode.toString().substr(-9);
};

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
          category_id: makeIdGreatAgain(link),
          parent_id: "",
          imageLink: encodeURI(url + image),
          image: `catalog/img/${encodeURI(image.split("/").slice(-1)[0])}`,
        };
        saveImageToDisk(
          encodeURI(`${url}${image}`),
          `./img/${encodeURI(image.split("/").slice(-1)[0])}`
        );
      });
      fs.writeFile(
        "json/categoriesmain.json",
        JSON.stringify({ cat: categories }),
        (err) => {
          if (err) console.log(err);
          else {
            console.log("File categories written successfully\n");
          }
        }
      );
      const full = [];
      categories.forEach((item) => {
        axios.get(item.fulllink).then((res) => {
          const subcategories = [];
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
            subcategories[index] = {
              title,
              link: link,
              fulllink: url + link,
              category_id: makeIdGreatAgain(link),
              parent_id: item.category_id,
              imageLink: encodeURI(url + image),
              image: `catalog/img/${encodeURI(image.split("/").slice(-1)[0])}`,
            };
            const current = {
              title,
              link: link,
              fulllink: url + link,
              category_id: makeIdGreatAgain(link),
              parent_id: item.category_id,
              imageLink: encodeURI(url + image),
              image: `catalog/img/${encodeURI(image.split("/").slice(-1)[0])}`,
            };
            saveImageToDisk(
              encodeURI(`${url}${image}`),
              `./img/${encodeURI(image.split("/").slice(-1)[0])}`
            );
            if (
              current &&
              current.title &&
              current.link &&
              current.fulllink &&
              current.category_id
            ) {
              fs.readFile("json/categoriesmain.json", function (err, content) {
                if (err) throw err;
                const parseJson = JSON.parse(content);
                for (i = 0; i < 11; i++) {
                  parseJson.cat.concat(current);
                }
                fs.writeFile(
                  "json/categories.json",
                  JSON.stringify(parseJson),
                  function (err) {
                    if (err) throw err;
                  }
                );
              });
            }
          });
        });
      });
      resolve(categories);
    });
  });
}

async function takeProducts() {
  const categories = await takeCategories();
  // const categoryList = fs.readFile("json/categories.json", (err, data) => {
  //   if (err) throw err;
  //   console.log(data);
  // });
  return new Promise((resolve) => {
    return categories;
  });
}

takeProducts();
