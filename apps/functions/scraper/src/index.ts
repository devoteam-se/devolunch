import puppeteer from 'puppeteer';
import { Storage } from '@google-cloud/storage';
import * as ff from '@google-cloud/functions-framework';
import path from 'path';
import { fileURLToPath } from 'url';

import { createConfig } from './config.js';
import { translateRestaurants } from './utils/translator.js';
import { getRestaurantFilePaths, scrapeRestaurant } from './scraper.js';
import { Scrape } from '@devolunch/shared';

const RESTAURANTS_PATH = './restaurants';

export const BUCKET_NAME = 'devolunchv2';
export const config = createConfig();
export const storage = new Storage({
  projectId: 'devolunch',
});

ff.http('scrape', async (_: ff.Request, res: ff.Response) => {
  const browser = await puppeteer.launch({
    args: !config.development ? ['--disable-gpu'] : [],
    headless: 'new',
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dir = path.join(__dirname, RESTAURANTS_PATH);

  const files = await getRestaurantFilePaths(dir);

  const restaurants = [];
  for (const file of files) {
    restaurants.push(await scrapeRestaurant(browser, dir, file));
  }

  await browser.close();

  // used to debug scraper
  const filesOverride = config.filesOverride?.split(',');
  if (filesOverride?.length) {
    res.sendStatus(200);
    return;
  }

  // if any of the dishes contains the word 'stängt', we assume the restaurant is closed
  const scrape: Scrape = {
    date: new Date(),
    restaurants: await translateRestaurants(restaurants),
  };

  if (!scrape?.restaurants?.length) {
    res.sendStatus(500);
    return;
  }

  const bucket = storage.bucket(BUCKET_NAME);
  await bucket.file('scrape.json').save(JSON.stringify(scrape));

  res.sendStatus(200);
});
