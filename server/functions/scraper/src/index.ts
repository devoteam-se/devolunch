import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { Storage } from '@google-cloud/storage';
import * as ff from '@google-cloud/functions-framework';

import { createConfig } from './config';
import { translateRestaurants } from './translator';

export const config = createConfig();

const RESTAURANTS_PATH = './restaurants';
const TIMEOUT = 120000;

const BUCKET_NAME = 'devolunchv2';

const storage = new Storage({
  projectId: 'devolunch',
});

const compareDish = (a: App.Dish, b: App.Dish): number => {
  const order: { [key: string]: number } = { veg: 1, fish: 2, meat: 3, misc: 4 };
  return order[a.type] - order[b.type];
};

ff.http('scrape', async (req: ff.Request, res: ff.Response) => {
  const browser = await puppeteer.launch({
    args: !config.development ? ['--disable-gpu'] : [],
    headless: 'new',
  });

  const files = await fs.readdir(path.join(__dirname, RESTAURANTS_PATH));
  let targetFiles = files.filter((file) => {
    return path.extname(file).toLowerCase() === '.js';
  });
  const restaurants: App.Restaurant[] = [];

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
              language: config.defaultLanguage,
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
  };

  if (!scrape?.restaurants?.length) {
    res.sendStatus(500);
    return;
  }

  const bucket = storage.bucket(BUCKET_NAME);
  await bucket.file('scrape.json').save(JSON.stringify(scrape));

  res.sendStatus(200);
});
