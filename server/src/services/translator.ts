import { v2 } from '@google-cloud/translate';

import logger from '../logger';
import { env } from '../env';

const translate = new v2.Translate({
  projectId: 'devolunch',
});

export const translateText = async (from: string, to: string, originalText: Dish['description']) => {
  if (!originalText?.length) {
    console.error('Text to translate is not defined');
    return '';
  }

  if (!from?.length || !to?.length) {
    console.error(`Either 'from' or 'to' language is not defined, to: ${to}, from: ${from}`);
    return '';
  }

  const [translation] = await translate.translate(originalText, {
    from,
    to,
  });
  return translation;
};

const translateRestaurant = async (restaurant: Restaurant) => {
  try {
    await Promise.all(
      env.TRANSLATE_LANGUAGES.split(',').map(async (language) => {
        restaurant.dishCollection.push({
          language,
          dishes: await Promise.all(
            restaurant.dishCollection[0].dishes.map(async (dish) => ({
              ...dish,
              description: await translateText(env.DEFAULT_LANGUAGE, language, dish.description),
            })),
          ),
        });
      }),
    );
  } catch (err: unknown) {
    logger.error("Can't reach google translate service");
  }
  return restaurant;
};

export const translateRestaurants = async (restaurants: Restaurant[]) =>
  await Promise.all(restaurants.map(async (restaurant: Restaurant) => await translateRestaurant(restaurant)));
