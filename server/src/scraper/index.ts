import puppeteer = require("puppeteer");
import fs from "fs/promises";
import path from "path";

import { env } from "../env";
import { uploadScrape } from "../services/storage";
import { translateRestaurants } from "../services/translator";

const restaurantsPath = "./restaurants";
const TIMEOUT = 120000;

const compareDish = (a: Dish, b: Dish) => {
  const order: { [key: string]: number } = { veg: 1, fish: 2, meat: 3, misc: 4 };
  return order[a.type] - order[b.type];
};

const scrape = async () => {
  const browser = await puppeteer.launch({
    args: env.NODE_ENV !== "development" ? ["--disable-gpu"] : [],
    headless: true,
  });

  let files = await fs.readdir(path.join(__dirname, restaurantsPath));
  const restaurants: Restaurant[] = [];

  // const filesOverride: string[] = ["slagthuset.ts"];
  const filesOverride: string[] = [];
  if (filesOverride.length) {
    files = filesOverride;
  }

  for (const file of files) {
    const restaurant = await import(path.join(__dirname, restaurantsPath, file));
    const page = await browser.newPage();
    page.on("console", (msg) => console.log(msg.text()));
    await page.goto(restaurant.meta.url, {
      waitUntil: "load",
      timeout: TIMEOUT,
    });

    try {
      console.log("scraping", restaurant.meta.url);
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
    } catch (err: unknown) {
      console.log(err);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  const scrape = {
    date: new Date(),
    restaurants: await translateRestaurants(
      restaurants.map((restaurant: Restaurant) => ({
        ...restaurant,
        dishCollection: restaurant.dishCollection.map((dishCollection) => ({
          ...dishCollection,
          dishes: dishCollection.dishes.sort(compareDish).map((dish) => ({
            ...dish,
          })),
        })),
      }))
    ),
  };

  await uploadScrape(scrape);
};

export default scrape;
