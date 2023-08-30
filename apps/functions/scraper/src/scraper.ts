import fs from 'fs/promises';
import path from 'path';
import { Browser } from 'puppeteer';

import { config } from './index.js';
import { DishProps, RestaurantProps } from '@devolunch/shared';
import resizeImage from './utils/image-resizer.js';
import { updateDishType } from './utils/dish-type-lookup.js';
import { compareDish } from './utils/sort.js';

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
  const { meta: restaurantMeta, browserScrapeFunction } = await import(path.join(dir, file));

  const page = await browser.newPage();
  page.on('console', (msg) => console.log(msg.text()));

  try {
    await page.goto(restaurantMeta.url, {
      waitUntil: 'load',
      timeout: TIMEOUT,
    });

    console.log(`Scraping ${restaurantMeta.title} on ${restaurantMeta.url}`);
    const dishes = await browserScrapeFunction(page);

    console.log(`Resizing image for ${restaurantMeta.title}`);
    // upload image to bucket if there are any
    const imageUrl = await resizeImage(restaurantMeta.imageUrl, restaurantMeta.title, {
      size: {
        width: 400,
        height: 300,
      },
      quality: 70,
    });

    const imageUrlLowQuality = await resizeImage(restaurantMeta.imageUrl, restaurantMeta.title, {
      size: {
        width: 40,
        height: 30,
      },
      quality: 10,
    });

    const isClosed = dishes?.some((dish: DishProps) => dish.title?.toLowerCase().includes('stängt'));

    const restaurant: RestaurantProps = {
      ...restaurantMeta,
      imageUrl: imageUrl,
      imageUrlLowQuality: imageUrlLowQuality,
      dishCollection: [
        {
          language: config.defaultLanguage,
          dishes: isClosed
            ? []
            : dishes
                ?.map((dish: DishProps) =>
                  updateDishType(dish, {
                    unknownDishTypeDefault: restaurantMeta?.unknownMealDefault,
                  }),
                )
                ?.sort(compareDish),
        },
      ],
    };

    return restaurant;
  } catch (err: unknown) {
    console.error('Error', err);
    return {
      ...restaurantMeta,
      dishCollection: [],
    };
  } finally {
    await page.close();
  }
};
