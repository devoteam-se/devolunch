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

  // Process files in parallel with controlled concurrency
  const MAX_CONCURRENT_FILES = config.maxConcurrentFiles || 3;
  const restaurants: any[] = [];

  const processFilesBatch = async (fileBatch: string[]) => {
    const promises = fileBatch.map(async (file) => {
      try {
        const result = await scrapeRestaurant(browser, dir, file);
        if (Array.isArray(result)) {
          return result;
        } else if (result) {
          return [result];
        }
        return [];
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        return [];
      }
    });

    const results = await Promise.all(promises);
    return results.flat();
  };

  // Process files in batches to avoid overwhelming the browser
  for (let i = 0; i < files.length; i += MAX_CONCURRENT_FILES) {
    const batch = files.slice(i, i + MAX_CONCURRENT_FILES);
    const batchResults = await processFilesBatch(batch);
    restaurants.push(...batchResults);
    console.log(
      `Processed batch ${Math.ceil((i + 1) / MAX_CONCURRENT_FILES)}/${Math.ceil(
        files.length / MAX_CONCURRENT_FILES,
      )}: ${batchResults.length} restaurants`,
    );
  }

  await browser.close();

  // used to debug scraper
  const filesOverride = config.filesOverride?.split(',');
  if (filesOverride?.length) {
    // In debug mode, return scraped data without uploading to cloud
    const scrape: Scrape = {
      date: new Date(),
      restaurants: await translateRestaurants(restaurants),
    };
    res.json(scrape);
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
