import { v2 } from '@google-cloud/translate';

import { config } from '../config.js';
import { logger } from '@devolunch/shared/logger/node';
import { DishProps, RestaurantProps, RestaurantLocation } from '@devolunch/shared';

const translate = new v2.Translate({
  projectId: 'devolunch',
});

export const translateText = async (from: string, to: string, originalText: DishProps['title']) => {
  if (!originalText?.length) {
    logger.error('Text to translate is not defined');
    return '';
  }

  if (!from?.length || !to?.length) {
    logger.error(`Either 'from' or 'to' language is not defined, to: ${to}, from: ${from}`);
    return '';
  }

  const [translation] = await translate.translate(originalText, {
    from,
    to,
  });
  return translation;
};

const translateRestaurant = async (restaurant: RestaurantProps) => {
  try {
    await Promise.all(
      config.translateLanguages.split(',')?.map(async (language: string) => {
        // Translate top-level dishes (single-location)
        if (restaurant.dishCollection) {
          restaurant.dishCollection.push({
            language,
            dishes: restaurant.dishCollection.filter((a) => a.dishes?.length).length
              ? await Promise.all(
                  restaurant.dishCollection[0]?.dishes?.map(async (dish) => ({
                    ...dish,
                    title: await translateText(config.defaultLanguage, language, dish.title),
                  })),
                )
              : [],
          });
        }

        // Translate multi-location dishes
        if (restaurant.locations?.length) {
          await Promise.all(
            restaurant.locations.map(async (loc: RestaurantLocation) => {
              if (!loc.dishCollection) return;
              const base = loc.dishCollection[0]?.dishes || [];
              const translated = base.length
                ? await Promise.all(
                    base.map(async (dish) => ({
                      ...dish,
                      title: await translateText(config.defaultLanguage, language, dish.title),
                    })),
                  )
                : [];
              loc.dishCollection.push({ language, dishes: translated });
            }),
          );
        }
      }),
    );
  } catch (err: unknown) {
    logger.error("Can't reach google translate service");
    logger.error({ err }, 'Translation error');
  }
  return restaurant;
};

export const translateRestaurants = async (restaurants: RestaurantProps[]) => {
  if (config.development) {
    logger.info('Development mode: Skipping translation service');
    // In development, just add English dishes as copies of Swedish (top-level and locations)
    return restaurants.map((restaurant) => ({
      ...restaurant,
      dishCollection: [
        ...(restaurant.dishCollection || []),
        ...(restaurant.dishCollection?.map((collection) => ({
          language: 'en',
          dishes: collection.dishes || [],
        })) || []),
      ],
      locations: restaurant.locations?.map((loc) => ({
        ...loc,
        dishCollection: [
          ...(loc.dishCollection || []),
          ...(loc.dishCollection?.map((collection) => ({
            language: 'en',
            dishes: collection.dishes || [],
          })) || []),
        ],
      })),
    }));
  }

  return await Promise.all(
    restaurants.map(async (restaurant: RestaurantProps) => await translateRestaurant(restaurant)),
  );
};
