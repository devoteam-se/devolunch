import puppeteer from 'puppeteer';
import { Storage } from '@google-cloud/storage';
import * as ff from '@google-cloud/functions-framework';
import path from 'path';
import { fileURLToPath } from 'url';

import { createConfig } from './config.js';
import { getRestaurantFilePaths, renderOutput, scrapeRestaurant } from './scraper.js';
import { resizeImage } from './image-resizer.js';

const RESTAURANTS_PATH = './restaurants';
export const config = createConfig();

export const storage = new Storage({
  projectId: 'devolunch',
});
export const BUCKET_NAME = 'devolunchv2';

ff.http('scrape', async (_: ff.Request, res: ff.Response) => {
  const browser = await puppeteer.launch({
    args: !config.development ? ['--disable-gpu'] : [],
    headless: 'new',
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dir = path.join(__dirname, RESTAURANTS_PATH);

  const files = await getRestaurantFilePaths(dir);

  const restaurants = await Promise.all(files.map(async (file: string) => scrapeRestaurant(browser, dir, file)));

  await browser.close();

  await Promise.all(files.map(async (file: string) => resizeImage(dir, file)));

  const filesOverride = config.filesOverride?.split(',');

  if (filesOverride?.length) {
    res.sendStatus(200);
    return;
  }

  const scrape = await renderOutput(restaurants);

  if (!scrape?.restaurants?.length) {
    res.sendStatus(500);
    return;
  }

  const bucket = storage.bucket(BUCKET_NAME);
  await bucket.file('scrape.json').save(JSON.stringify(scrape));

  res.sendStatus(200);
});