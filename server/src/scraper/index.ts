import puppeteer = require('puppeteer');
import fs from 'fs/promises';
import path from 'path';

import { env } from '../env';
import { uploadScrape } from '../services/storage';
import { translateRestaurants } from '../services/translator';

const RESTAURANTS_PATH = './restaurants';
const TIMEOUT = 120000;

const compareDish = (a: Dish, b: Dish): number => {
  const order: { [key: string]: number } = { veg: 1, fish: 2, meat: 3, misc: 4 };
  return order[a.type] - order[b.type];
};

const scrape = async () => {
  const browser = await puppeteer.launch({
    args: env.NODE_ENV !== 'development' ? ['--disable-gpu'] : [],
    headless: 'new',
  });

  const files = await fs.readdir(path.join(__dirname, RESTAURANTS_PATH));
  let targetFiles = files.filter((file) => {
    return path.extname(file).toLowerCase() === (env.NODE_ENV === 'development' ? '.ts' : '.js');
  });
  const restaurants: Restaurant[] = [];

  // const filesOverride: string[] = ['hylliebistro.ts'];
  const filesOverride: string[] = [];
  if (filesOverride.length) {
    targetFiles = filesOverride;
  }

  await Promise.all(
    targetFiles.map(async (file) => {
      const restaurant = await import(path.join(__dirname, RESTAURANTS_PATH, file));
      const page = await browser.newPage();
      page.on('console', (msg) => console.log(msg.text()));
      await page.goto(restaurant.meta.url, {
        waitUntil: 'load',
        timeout: TIMEOUT,
      });

      try {
        console.log('scraping', restaurant.meta.url);
        let result = await restaurant.browserScrapeFunction(page);

        if (restaurant.meta.pdf) {
          result = await restaurant.pdfScrapeFunction(result);
        }

        restaurants.push({
          ...restaurant.meta,
          dishCollection: [
            {
              language: env.DEFAULT_LANGUAGE,
              dishes: result,
            },
          ],
        });
      } catch (err: unknown) {
        console.error(err);
      } finally {
        await page.close();
      }
    }),
  );

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
      })),
    ),
  };

  await uploadScrape(scrape);
};

export default scrape;
