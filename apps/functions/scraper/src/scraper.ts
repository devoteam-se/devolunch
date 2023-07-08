import fs from 'fs/promises';
import path from 'path';
import { Browser } from 'puppeteer';

import { config } from './index.js';
import { compareDish } from './utils/sort.js';
import { translateRestaurants } from './translator.js';
import { DishCollectionProps, DishProps, RestaurantProps } from '@devolunch/shared';

const TIMEOUT = 120000;

export const getRestaurantFilePaths = async (dir: string) => {
  const files = await fs.readdir(dir);
  let targetFiles = files.filter((file) => {
    return path.extname(file).toLowerCase() === '.js';
  });

  const filesOverride = config.filesOverride?.split(',');
  if (filesOverride?.length) {
    targetFiles = filesOverride;
  }
  return targetFiles;
};

export const scrapeRestaurant = async (browser: Browser, dir: string, file: string) => {
  const restaurant = await import(path.join(dir, file));
  const page = await browser.newPage();
  page.on('console', (msg) => console.log(msg.text()));

  try {
    await page.goto(restaurant.meta.url, {
      waitUntil: 'load',
      timeout: TIMEOUT,
    });

    console.log(`Scraping ${restaurant.meta.title} on ${restaurant.meta.url}`);
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
    console.error('Error', err);
    return {
      ...restaurant.meta,
      dishCollection: [],
    };
  } finally {
    await page.close();
  }
};

export const renderOutput = async (restaurants: RestaurantProps[]) => ({
  date: new Date(),
  restaurants: await translateRestaurants(
    restaurants.map((restaurant: RestaurantProps) => ({
      ...restaurant,
      dishCollection: restaurant?.dishCollection.map((dishCollection: DishCollectionProps) => ({
        ...dishCollection,
        dishes: dishCollection.dishes.sort(compareDish).map((dish: DishProps) => ({
          ...dish,
        })),
      })),
    })),
  ),
});
