const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const uuid = require("uuid");
const path = require("path");
const ID = require("nodejs-unique-numeric-id-generator");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const saveImageToDisk = require("./img");

const url = "https://audio-master.net";
const db = new JsonDB(new Config("dataBase", true, false, "/"));

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
    const categories = [];
    axios.get(url).then((res) => {
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
          fulllink: url + link + "/results,1-999",
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
      db.push("/cat", categories);
      console.log("categories written");
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
              fulllink: url + link + "/results,1-999",
              category_id: makeIdGreatAgain(link),
              parent_id: item.category_id,
              imageLink: encodeURI(url + image),
              image: `catalog/img/${encodeURI(image.split("/").slice(-1)[0])}`,
            };
            const current = {
              title,
              link: link,
              fulllink: url + link + "/results,1-999",
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
              db.push("/cat", [current], false);
            }
          });
        });
      });
      console.log("sub categories written");
    });
    resolve(db.getData("/cat"));
  });
}

async function takeProducts() {
  const categoryList = await takeCategories();
  cats = db.getData("/cat");
  return new Promise((resolve) => {
    cats.forEach((item) => {
      axios.get(item.fulllink).then((res) => {
        const products = [];
        const $ = cheerio.load(res.data);
        const get = $(".vm-product-media-container").each((index, element) => {
          const link = $(element).children("a").attr("href");
          if (link && link !== "") {
            db.push(
              "/productlinks",
              [{ link: url + link, category_id: item.category_id }],
              false
            );
          }
        });
      });
    });
  });
}

takeProducts();
