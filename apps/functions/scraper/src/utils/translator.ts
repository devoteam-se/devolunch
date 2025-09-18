import { v2 } from '@google-cloud/translate';

import { config } from '../index.js';
import { DishProps, RestaurantProps } from '@devolunch/shared';

const translate = new v2.Translate({
  projectId: 'devolunch',
});

export const translateText = async (from: string, to: string, originalText: DishProps['title']) => {
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

const translateRestaurant = async (restaurant: RestaurantProps) => {
  try {
    await Promise.all(
      config.translateLanguages.split(',')?.map(async (language: string) => {
        restaurant.dishCollection?.push({
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
      }),
    );
  } catch (err: unknown) {
    console.error("Can't reach google translate service");
    console.error(err);
  }
  return restaurant;
};

export const translateRestaurants = async (restaurants: RestaurantProps[]) => {
  if (config.development) {
    console.log('🔧 Development mode: Skipping translation service');
    // In development, just add English dishes as copies of Swedish
    return restaurants.map((restaurant) => ({
      ...restaurant,
      dishCollection: [
        ...(restaurant.dishCollection || []),
        ...(restaurant.dishCollection?.map((collection) => ({
          language: 'en',
          dishes: collection.dishes || [],
        })) || []),
      ],
    }));
  }

  return await Promise.all(
    restaurants.map(async (restaurant: RestaurantProps) => await translateRestaurant(restaurant)),
  );
};
