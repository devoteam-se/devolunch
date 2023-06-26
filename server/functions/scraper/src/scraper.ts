import fs from 'fs/promises';
import path from 'path';
import { Browser } from 'puppeteer';

import { config } from '.';
import { compareDish } from './utils/sort';
import { translateRestaurants } from './translator';

const RESTAURANTS_PATH = './restaurants';
const TIMEOUT = 120000;

export const getRestaurantFilePaths = async () => {
  const files = await fs.readdir(path.join(__dirname, RESTAURANTS_PATH));
  let targetFiles = files.filter((file) => {
    return path.extname(file).toLowerCase() === '.js';
  });

  const filesOverride = config.filesOverride?.split(',');
  if (filesOverride?.length) {
    targetFiles = filesOverride;
  }
  return targetFiles;
};

export const scrapeRestaurant = async (browser: Browser, file: string) => {
  const restaurant = await import(path.join(__dirname, RESTAURANTS_PATH, file));
  const page = await browser.newPage();
  page.on('console', (msg) => console.log(msg.text()));

  try {
    await page.goto(restaurant.meta.url, {
      waitUntil: 'load',
      timeout: TIMEOUT,
    });

    console.log(`Scraper ${restaurant.meta.title} on ${restaurant.meta.url}`);
    const result = await restaurant.browserScrapeFunction(page);

    return {
      ...restaurant.meta,
      dishCollection: [
        {
          language: config.defaultLanguage,
          dishes: result,
        },
      ],
    };
  } catch (err: unknown) {
    console.error(err);
    return {
      ...restaurant.meta,
      dishCollection: [],
    };
  } finally {
    await page.close();
  }
};

export const renderOutput = async (restaurants: App.Restaurant[]) => ({
  date: new Date(),
  restaurants: await translateRestaurants(
    restaurants.map((restaurant: App.Restaurant) => ({
      ...restaurant,
      dishCollection: restaurant.dishCollection.map((dishCollection) => ({
        ...dishCollection,
        dishes: dishCollection.dishes.sort(compareDish).map((dish) => ({
          ...dish,
        })),
      })),
    })),
  ),
});
