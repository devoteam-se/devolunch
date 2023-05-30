import puppeteer from 'puppeteer';
import { Storage } from '@google-cloud/storage';
import * as ff from '@google-cloud/functions-framework';

import { createConfig } from './config';
import { getRestaurantFilePaths, renderOutput, scrapeRestaurant } from './scraper';

export const config = createConfig();

const storage = new Storage({
  projectId: 'devolunch',
});
const BUCKET_NAME = 'devolunchv2';

ff.http('scrape', async (req: ff.Request, res: ff.Response) => {
  const browser = await puppeteer.launch({
    args: !config.development ? ['--disable-gpu'] : [],
    headless: 'new',
  });

  const files = await getRestaurantFilePaths();

  const restaurants = await Promise.all(files.map(async (file: string) => scrapeRestaurant(browser, file)));

  await browser.close();

  const scrape = await renderOutput(restaurants);

  if (!scrape?.restaurants?.length) {
    res.sendStatus(500);
    return;
  }

  const bucket = storage.bucket(BUCKET_NAME);
  await bucket.file('scrape.json').save(JSON.stringify(scrape));

  res.sendStatus(200);
});
