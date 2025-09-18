import fs from 'fs/promises';
import path from 'path';
import { Browser } from 'puppeteer';

import { config } from './index.js';
import { DishProps, RestaurantProps, RestaurantMetaProps, RestaurantLocation } from '@devolunch/shared';
import resizeImage from './utils/image-resizer.js';
import { updateDishType } from './utils/dish-type-lookup.js';
import { compareDish } from './utils/sort.js';

const TIMEOUT = 120000;

export const getRestaurantFilePaths = async (dir: string) => {
  const files = await fs.readdir(dir);
  let targetFiles = files.filter((file) => {
    const extname = path.extname(file).toLowerCase();
    const isTestFile = file.toLowerCase().endsWith('.test.js');
    return extname === '.js' && !isTestFile;
  });

  const filesOverride = config.filesOverride?.split(',');
  if (filesOverride?.length) {
    targetFiles = filesOverride;
  } else {
    // If the generic AI scraper is present, prioritize it exclusively
    if (targetFiles.includes('ai-generic.js')) {
      targetFiles = ['ai-generic.js'];
    }
  }
  return targetFiles;
};

export const scrapeRestaurant = async (browser: Browser, dir: string, file: string) => {
  const mod: any = await import(path.join(dir, file));

  // Support single, multi, or async getter
  let metas: RestaurantMetaProps[] = [];
  if (Array.isArray(mod.metas)) {
    metas = mod.metas;
  } else if (typeof mod.getMetas === 'function') {
    metas = await mod.getMetas();
  } else if (mod.meta) {
    metas = [mod.meta];
  }
  const browserScrapeFunction = mod.browserScrapeFunction;

  if (!browserScrapeFunction || metas.length === 0) {
    throw new Error(`Module ${file} does not export expected meta/metas and browserScrapeFunction`);
  }

  // Process restaurants in parallel with controlled concurrency
  const MAX_CONCURRENT_RESTAURANTS = config.maxConcurrentRestaurants || 5;
  const results: RestaurantProps[] = [];

  // Helper function to process images and create restaurant object
  const createRestaurantResult = async (
    restaurantMeta: RestaurantMetaProps,
    dishes: DishProps[],
    title?: string,
    googleMapsUrl?: string,
    coordinate?: { lat: number; lon: number },
  ): Promise<RestaurantProps> => {
    // Skip image processing in development to avoid Google Cloud credentials
    let imageUrl = restaurantMeta.imageUrl;
    let imageUrlLowQuality = restaurantMeta.imageUrl;

    if (config.development) {
      console.log(`🔧 Development mode: Skipping image processing for ${title || restaurantMeta.title}`);
    } else {
      console.log(`📷 Resizing image for ${title || restaurantMeta.title}`);

      // upload image to bucket if there are any
      imageUrl = await resizeImage(restaurantMeta.imageUrl, title || restaurantMeta.title, {
        size: {
          width: 400,
          height: 300,
        },
        quality: 70,
      });

      imageUrlLowQuality = await resizeImage(restaurantMeta.imageUrl, title || restaurantMeta.title, {
        size: {
          width: 40,
          height: 30,
        },
        quality: 10,
      });
    }

    const isClosed = dishes?.some((dish: DishProps) => dish.title?.toLowerCase().includes('stängt'));

    return {
      title: title || restaurantMeta.title,
      url: restaurantMeta.url,
      imageUrl: imageUrl,
      imageUrlLowQuality: imageUrlLowQuality,
      googleMapsUrl: googleMapsUrl || restaurantMeta.googleMapsUrl,
      coordinate: coordinate || restaurantMeta.coordinate,
      unknownMealDefault: restaurantMeta.unknownMealDefault,
      locationFilter: restaurantMeta.locationFilter,
      dishCollection: [
        {
          language: config.defaultLanguage,
          dishes: isClosed
            ? []
            : dishes
                ?.map((dish: DishProps) =>
                  updateDishType(dish, {
                    unknownDishTypeDefault: restaurantMeta?.unknownMealDefault ?? 'misc',
                  }),
                )
                ?.sort(compareDish),
        },
      ],
    };
  };

  // Helper function to create multi-location restaurant object
  const createMultiLocationRestaurant = async (
    restaurantMeta: RestaurantMetaProps,
    locationResults: { location: RestaurantLocation; dishes: DishProps[] }[],
  ): Promise<RestaurantProps> => {
    // Use the base restaurant meta for common properties
    let imageUrl = restaurantMeta.imageUrl;
    let imageUrlLowQuality = restaurantMeta.imageUrl;

    if (config.development) {
      console.log(`🔧 Development mode: Skipping image processing for ${restaurantMeta.title}`);
    } else {
      console.log(`📷 Resizing image for ${restaurantMeta.title}`);

      // upload image to bucket if there are any
      imageUrl = await resizeImage(restaurantMeta.imageUrl, restaurantMeta.title, {
        size: {
          width: 400,
          height: 300,
        },
        quality: 70,
      });

      imageUrlLowQuality = await resizeImage(restaurantMeta.imageUrl, restaurantMeta.title, {
        size: {
          width: 40,
          height: 30,
        },
        quality: 10,
      });
    }

    // Find the primary location (first one) for main restaurant data
    const primaryLocation = locationResults[0];
    if (!primaryLocation) {
      throw new Error(`No locations provided for ${restaurantMeta.title}`);
    }

    return {
      title: restaurantMeta.title,
      url: restaurantMeta.url,
      imageUrl: imageUrl,
      imageUrlLowQuality: imageUrlLowQuality,
      googleMapsUrl: primaryLocation.location.googleMapsUrl,
      coordinate: primaryLocation.location.coordinate,
      unknownMealDefault: restaurantMeta.unknownMealDefault,
      locationFilter: restaurantMeta.locationFilter,
      locations: locationResults.map(({ location, dishes }) => ({
        title: location.title,
        googleMapsUrl: location.googleMapsUrl,
        coordinate: location.coordinate,
        url: location.url,
        locationFilter: location.locationFilter,
        dishCollection: [
          {
            language: config.defaultLanguage,
            dishes:
              dishes
                ?.map((dish: DishProps) =>
                  updateDishType(dish, {
                    unknownDishTypeDefault: restaurantMeta?.unknownMealDefault ?? 'misc',
                  }),
                )
                ?.sort(compareDish) || [],
          },
        ],
      })),
      dishCollection: [
        {
          language: config.defaultLanguage,
          dishes:
            primaryLocation.dishes
              ?.map((dish: DishProps) =>
                updateDishType(dish, {
                  unknownDishTypeDefault: restaurantMeta?.unknownMealDefault ?? 'misc',
                }),
              )
              ?.sort(compareDish) || [],
        },
      ],
    };
  };

  const processRestaurantsBatch = async (restaurantBatch: typeof metas) => {
    const promises = restaurantBatch.map(async (restaurantMeta) => {
      // Handle multi-location restaurants
      if (restaurantMeta.multiLocation) {
        const locationResults: { location: RestaurantLocation; dishes: DishProps[] }[] = [];

        if (restaurantMeta.multiLocation.type === 'shared') {
          // Shared menu: scrape once, use for all locations
          const page = await browser.newPage();
          page.on('console', (msg) => console.log(msg.text()));

          try {
            await page.goto(restaurantMeta.url, {
              waitUntil: 'load',
              timeout: TIMEOUT,
            });

            console.log(`Scraping ${restaurantMeta.title} (shared menu) on ${restaurantMeta.url}`);
            const dishes: DishProps[] = await (browserScrapeFunction.length >= 2
              ? browserScrapeFunction(page, restaurantMeta)
              : browserScrapeFunction(page));

            // Create result for each location with same dishes
            for (const location of restaurantMeta.multiLocation.locations) {
              locationResults.push({ location, dishes });
            }
          } catch (err: unknown) {
            console.error(`Error scraping ${restaurantMeta.title} (shared):`, err);
            // Create empty results for all locations
            for (const location of restaurantMeta.multiLocation.locations) {
              locationResults.push({ location, dishes: [] });
            }
          } finally {
            await page.close();
          }
        }

        if (restaurantMeta.multiLocation.type === 'filtered') {
          // Filtered: scrape once, filter per location
          const page = await browser.newPage();
          page.on('console', (msg) => console.log(msg.text()));

          try {
            await page.goto(restaurantMeta.url, {
              waitUntil: 'load',
              timeout: TIMEOUT,
            });

            console.log(`Scraping ${restaurantMeta.title} (filtered menu) on ${restaurantMeta.url}`);

            // Create filtered meta for each location
            for (const location of restaurantMeta.multiLocation.locations) {
              const filteredMeta = {
                ...restaurantMeta,
                title: location.title,
                locationFilter: location.locationFilter,
              };

              const dishes: DishProps[] = await (browserScrapeFunction.length >= 2
                ? browserScrapeFunction(page, filteredMeta)
                : browserScrapeFunction(page));

              locationResults.push({ location, dishes });
            }
          } catch (err: unknown) {
            console.error(`Error scraping ${restaurantMeta.title} (filtered):`, err);
            // Create empty results for all locations
            for (const location of restaurantMeta.multiLocation.locations) {
              locationResults.push({ location, dishes: [] });
            }
          } finally {
            await page.close();
          }
        }

        if (restaurantMeta.multiLocation.type === 'separate') {
          // Separate: scrape each location individually
          for (const location of restaurantMeta.multiLocation.locations) {
            const page = await browser.newPage();
            page.on('console', (msg) => console.log(msg.text()));

            try {
              const locationUrl = location.url || restaurantMeta.url;
              await page.goto(locationUrl, {
                waitUntil: 'load',
                timeout: TIMEOUT,
              });

              console.log(`Scraping ${location.title} on ${locationUrl}`);

              const locationMeta = {
                ...restaurantMeta,
                title: location.title,
                url: locationUrl,
                locationFilter: location.locationFilter,
              };

              const dishes: DishProps[] = await (browserScrapeFunction.length >= 2
                ? browserScrapeFunction(page, locationMeta)
                : browserScrapeFunction(page));

              locationResults.push({ location, dishes });
            } catch (err: unknown) {
              console.error(`Error scraping ${location.title}:`, err);
              locationResults.push({ location, dishes: [] });
            } finally {
              await page.close();
            }
          }
        }

        const multiLocationRestaurant = await createMultiLocationRestaurant(restaurantMeta, locationResults);
        return [multiLocationRestaurant];
      } else {
        // Single location restaurant - original logic
        const page = await browser.newPage();
        page.on('console', (msg) => console.log(msg.text()));

        try {
          await page.goto(restaurantMeta.url, {
            waitUntil: 'load',
            timeout: TIMEOUT,
          });

          console.log(`Scraping ${restaurantMeta.title} on ${restaurantMeta.url}`);
          const dishes: DishProps[] = await (browserScrapeFunction.length >= 2
            ? browserScrapeFunction(page, restaurantMeta)
            : browserScrapeFunction(page));

          const restaurant = await createRestaurantResult(restaurantMeta, dishes);
          return [restaurant];
        } catch (err: unknown) {
          console.error(`Error scraping ${restaurantMeta.title}:`, err);
          return [
            {
              ...restaurantMeta,
              dishCollection: [],
            } as RestaurantProps,
          ];
        } finally {
          await page.close();
        }
      }
    });

    const batchResults = await Promise.all(promises);
    return batchResults.flat(); // Flatten since multi-location returns arrays
  };

  // Process restaurants in batches to avoid overwhelming the target websites
  for (let i = 0; i < metas.length; i += MAX_CONCURRENT_RESTAURANTS) {
    const batch = metas.slice(i, i + MAX_CONCURRENT_RESTAURANTS);
    const batchResults = await processRestaurantsBatch(batch);
    results.push(...batchResults);
    console.log(
      `  📊 Processed restaurant batch ${Math.ceil((i + 1) / MAX_CONCURRENT_RESTAURANTS)}/${Math.ceil(
        metas.length / MAX_CONCURRENT_RESTAURANTS,
      )} in ${file}: ${batchResults.length} restaurants`,
    );
  }

  return results.length === 1 ? results[0] : results;
};
