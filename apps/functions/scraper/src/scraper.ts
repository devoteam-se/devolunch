import puppeteer, { Browser, Page } from 'puppeteer';
import * as ff from '@google-cloud/functions-framework';

import { config } from './config.js';
import { translateRestaurants } from './utils/translator.js';
import { compareDish } from './utils/sort.js';
import { addClosureInfoToLunchMetadata } from './utils/closureDetection.js';
import type { RestaurantMetaProps, RestaurantProps, Scrape } from '@devolunch/shared';
import { logger } from '@devolunch/shared/logger/node';

// Import refactored modules
import { BUCKET_NAME, storage } from './utils/storage.js';
import { getRestaurantMetas } from './config/restaurantLoader.js';
import { buildPageContent } from './scrapers/content.js';
import { extractDishesWithFallback } from './services/dishExtractor.js';
import type { MenuExtractionResult } from './types/index.js';

/**
 * Scrapes a single page URL with optional location filter
 */
const scrapeFromUrl = async (
  page: Page,
  meta: RestaurantMetaProps,
  url: string,
  locationFilter?: string,
  otherLocationFilters?: string[],
): Promise<MenuExtractionResult> => {
  try {
    const content = await buildPageContent(page, meta, url);
    return await extractDishesWithFallback(page, content, meta, locationFilter, otherLocationFilters);
  } catch (error) {
    logger.error({ title: meta.title, locationFilter, err: error }, 'Error scraping');
    return { dishes: [], confidence: 0, reasoning: 'Error during scraping', lunchInfo: undefined };
  }
};

/**
 * Processes multiple restaurants and builds restaurant data with concurrent batch processing
 */
const processRestaurants = async (browser: Browser, metas: RestaurantMetaProps[]): Promise<RestaurantProps[]> => {
  const restaurants: RestaurantProps[] = [];
  const MAX_CONCURRENT = 5;

  // Process restaurants in batches
  for (let i = 0; i < metas.length; i += MAX_CONCURRENT) {
    const batch = metas.slice(i, i + MAX_CONCURRENT);

    const batchPromises = batch.map(async (meta) => {
      const page = await browser.newPage();
      try {
        // Multi-location handling
        if (meta.multiLocation) {
          const { type, locations } = meta.multiLocation;

          if (type === 'shared') {
            // Scrape once and share across locations
            const extractionResult = await scrapeFromUrl(page, meta, meta.url);
            const sorted = extractionResult.dishes?.sort(compareDish) || [];
            // Add closure detection to lunch metadata
            const lunchInfoWithClosure = addClosureInfoToLunchMetadata(meta.title, extractionResult.lunchInfo || {});

            const locs = locations.map((loc) => ({
              ...loc,
              dishCollection: [
                {
                  language: config.defaultLanguage,
                  dishes: lunchInfoWithClosure.closureInfo?.isClosed ? [] : sorted,
                  lunchInfo: lunchInfoWithClosure,
                },
              ],
            }));

            const restaurant: RestaurantProps = {
              title: meta.title,
              url: meta.url,
              imageUrl: meta.imageUrl,
              coordinate: meta.coordinate,
              googleMapsUrl: meta.googleMapsUrl,
              locations: locs,
              dishCollection: [], // Empty for multi-location restaurants
            };

            return restaurant;
          } else if (type === 'separate') {
            // Scrape each location separately
            const locs = await Promise.all(
              locations.map(async (loc) => {
                const locationPage = await browser.newPage();
                try {
                  const extractionResult = await scrapeFromUrl(locationPage, meta, loc.url || meta.url, loc.title);
                  const sorted = extractionResult.dishes?.sort(compareDish) || [];
                  const lunchInfoWithClosure = addClosureInfoToLunchMetadata(meta.title, extractionResult.lunchInfo || {});

                  return {
                    ...loc,
                    dishCollection: [
                      {
                        language: config.defaultLanguage,
                        dishes: lunchInfoWithClosure.closureInfo?.isClosed ? [] : sorted,
                        lunchInfo: lunchInfoWithClosure,
                      },
                    ],
                  };
                } finally {
                  await locationPage.close();
                }
              }),
            );

            const restaurant: RestaurantProps = {
              title: meta.title,
              url: meta.url,
              imageUrl: meta.imageUrl,
              coordinate: meta.coordinate,
              googleMapsUrl: meta.googleMapsUrl,
              locations: locs,
              dishCollection: [], // Empty for multi-location restaurants
            };

            return restaurant;
          } else if (type === 'filtered') {
            // Scrape once and filter content for each location
            const content = await buildPageContent(page, meta, meta.url);

            const locs = await Promise.all(
              locations.map(async (loc) => {
                const otherLocationFilters = locations
                  .filter((other) => other.title !== loc.title)
                  .map((other) => other.locationFilter || other.title);

                // Reuse the base content but with location-specific filtering
                const extractionResult = await extractDishesWithFallback(page, content, meta, loc.locationFilter || loc.title, otherLocationFilters);
                const sorted = extractionResult.dishes?.sort(compareDish) || [];
                const lunchInfoWithClosure = addClosureInfoToLunchMetadata(meta.title, extractionResult.lunchInfo || {});

                return {
                  ...loc,
                  dishCollection: [
                    {
                      language: config.defaultLanguage,
                      dishes: lunchInfoWithClosure.closureInfo?.isClosed ? [] : sorted,
                      lunchInfo: lunchInfoWithClosure,
                    },
                  ],
                };
              }),
            );

            const restaurant: RestaurantProps = {
              title: meta.title,
              url: meta.url,
              imageUrl: meta.imageUrl,
              coordinate: meta.coordinate,
              googleMapsUrl: meta.googleMapsUrl,
              locations: locs,
              dishCollection: [], // Empty for multi-location restaurants
            };

            return restaurant;
          }
        }

        // Single-location restaurant
        const extractionResult = await scrapeFromUrl(page, meta, meta.url);
        const sorted = extractionResult.dishes?.sort(compareDish) || [];
        const lunchInfoWithClosure = addClosureInfoToLunchMetadata(meta.title, extractionResult.lunchInfo || {});

        const restaurant: RestaurantProps = {
          title: meta.title,
          url: meta.url,
          imageUrl: meta.imageUrl,
          coordinate: meta.coordinate,
          googleMapsUrl: meta.googleMapsUrl,
          dishCollection: [
            {
              language: config.defaultLanguage,
              dishes: lunchInfoWithClosure.closureInfo?.isClosed ? [] : sorted,
              lunchInfo: lunchInfoWithClosure,
            },
          ],
        };

        return restaurant;
      } catch (error) {
        logger.error({ title: meta.title, err: error }, 'Error processing restaurant');
        return null;
      } finally {
        await page.close();
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const validRestaurants = batchResults.filter((r): r is RestaurantProps => r !== null);
    restaurants.push(...validRestaurants);

    logger.info(
      {
        batch: Math.ceil((i + 1) / MAX_CONCURRENT),
        totalBatches: Math.ceil(metas.length / MAX_CONCURRENT),
        processed: validRestaurants.length,
      },
      'Processed restaurant batch',
    );
  }

  return restaurants;
};

/**
 * Main scraping logic - can be called directly or via HTTP
 */
export const runScraping = async (): Promise<Scrape> => {
  logger.info('Starting AI-powered restaurant scraping');

  const browser = await puppeteer.launch({
    args: !config.development ? ['--disable-gpu'] : [],
    headless: true,
  });

  try {
    // Get restaurant metadata
    const metas = getRestaurantMetas();
    logger.info({ count: metas.length }, 'Found restaurants to scrape');

    // Process all restaurants
    const restaurants = await processRestaurants(browser, metas);
    logger.info({ count: restaurants.length }, 'Completed scraping');

    await browser.close();

    // Prepare final scrape result
    const scrape: Scrape = {
      date: new Date(),
      restaurants: await translateRestaurants(restaurants),
    };

    // Development mode: save to local file
    if (config.development) {
      const fs = await import('fs/promises');
      const path = await import('path');

      const localFilePath = path.join(process.cwd(), 'scrape.json');

      // If TEST_OVERRIDE is used, merge with existing scrape.json to save time/tokens
      if (process.env.TEST_OVERRIDE) {
        try {
          const existingData = await fs.readFile(localFilePath, 'utf-8');
          const existingScrape = JSON.parse(existingData) as Scrape;

          // Create a map of scraped restaurants by title for fast lookup
          const scrapedRestaurantsMap = new Map(
            scrape.restaurants.map(r => [r.title, r])
          );

          // Update existing restaurants with new data, keep others unchanged
          const updatedRestaurants = existingScrape.restaurants.map(existingRestaurant => {
            const scrapedRestaurant = scrapedRestaurantsMap.get(existingRestaurant.title);
            return scrapedRestaurant || existingRestaurant;
          });

          // Add any completely new restaurants (shouldn't happen with TEST_OVERRIDE but just in case)
          const existingTitles = new Set(existingScrape.restaurants.map(r => r.title));
          const newRestaurants = scrape.restaurants.filter(r => !existingTitles.has(r.title));
          updatedRestaurants.push(...newRestaurants);

          const mergedScrape: Scrape = {
            date: new Date(),
            restaurants: updatedRestaurants,
          };

          await fs.writeFile(localFilePath, JSON.stringify(mergedScrape, null, 2));
          logger.info({
            updated: scrape.restaurants.length,
            total: updatedRestaurants.length,
            path: localFilePath
          }, 'Updated TEST_OVERRIDE restaurants in existing scrape.json');

          return mergedScrape;
        } catch (error) {
          logger.warn({ err: error }, 'Could not read existing scrape.json, creating new file');
          // Fall through to create new file
        }
      }

      // Normal behavior: create complete new file
      await fs.writeFile(localFilePath, JSON.stringify(scrape, null, 2));
      logger.info({ count: scrape.restaurants.length, path: localFilePath }, 'Saved restaurants to local file');
    } else {
      // Production: upload to storage
      if (!scrape?.restaurants?.length) {
        throw new Error('No restaurants scraped successfully');
      }

      const bucket = storage.bucket(BUCKET_NAME);
      await bucket.file('scrape.json').save(JSON.stringify(scrape));
      logger.info({ count: scrape.restaurants.length }, 'Uploaded restaurants to cloud storage');
    }

    return scrape;
  } catch (error) {
    logger.error({ err: error }, 'Scraping failed');
    await browser.close();
    throw error;
  }
};

// Cloud Function HTTP handler
ff.http('scrape', async (_req: ff.Request, res: ff.Response) => {
  void _req;
  try {
    const scrape = await runScraping();
    res.json(scrape);
  } catch (error) {
    logger.error({ err: error }, 'Scraping failed');
    res.sendStatus(500);
  }
});

// Direct execution when run as script
if (import.meta.url === `file://${process.argv[1]}`) {
  runScraping()
    .then(() => {
      logger.info('Scraping completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ err: error }, 'Direct scraping failed');
      process.exit(1);
    });
}