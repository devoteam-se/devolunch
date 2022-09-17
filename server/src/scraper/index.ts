import puppeteer = require("puppeteer");
import fs from "fs";
import path from "path";

import { env } from "../env";
import { uploadScrape } from "../services/storage";
import { translateRestaurants } from "../services/translator";

const restaurantsPath = "./src/scraper/restaurants";
const TIMEOUT = 120000;

const compare = (a: Dish, b: Dish) => {
  const order = { veg: 1, fish: 2, meat: 3, misc: 4 };
  return order[a.type] - order[b.type];
};

const scrape = async () => {
  const browser = await puppeteer.launch(
    Object.assign(
      {},
      env.NODE_ENV !== "development" && {
        executablePath: "/usr/bin/chromium-browser",
        args: ["--disable-gpu"],
      },
      { headless: true }
    )
  );

  const files = await fs.promises.readdir(restaurantsPath);
  const restaurants: Restaurant[] = [];

  for (const file of files) {
    const restaurant = await import(
      path.resolve(path.join(restaurantsPath, file))
    );
    const page = await browser.newPage();
    page.on("console", (msg) => console.log(msg.text()));
    await page.goto(restaurant.meta.url, {
      waitUntil: "load",
      timeout: TIMEOUT,
    });

    const dishes = await restaurant.browserScrapeFunction(page);
    restaurants.push({
      ...restaurant.meta,
      dishCollection: [
        {
          language: "sv",
          dishes: dishes,
        },
      ],
    });
  }

  await browser.close();

  const scrape = {
    date: new Date(),
    restaurants: await translateRestaurants(
      restaurants.map((restaurant: Restaurant) => ({
        ...restaurant,
        dishCollection: restaurant.dishCollection.map((dishCollection) => ({
          ...dishCollection,
          dishes: dishCollection.dishes.sort(compare).map((dish) => ({
            ...dish,
          })),
        })),
      }))
    ),
  };
  await uploadScrape(scrape);

  await browser.close();
};

export default scrape;
