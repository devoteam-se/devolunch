import { v2 } from '@google-cloud/translate';

import { config } from './index.js';

const translate = new v2.Translate({
  projectId: 'devolunch',
});

export const translateText = async (from: string, to: string, originalText: App.Dish['description']) => {
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

const translateRestaurant = async (restaurant: App.Restaurant) => {
  try {
    await Promise.all(
      config.translateLanguages.split(',')?.map(async (language) => {
        restaurant.dishCollection?.push({
          language,
          dishes: restaurant.dishCollection.filter((a) => a.dishes?.length).length
            ? await Promise.all(
                restaurant.dishCollection[0]?.dishes?.map(async (dish) => ({
                  ...dish,
                  description: await translateText(config.defaultLanguage, language, dish.description),
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

export const translateRestaurants = async (restaurants: App.Restaurant[]) =>
  await Promise.all(restaurants.map(async (restaurant: App.Restaurant) => await translateRestaurant(restaurant)));
