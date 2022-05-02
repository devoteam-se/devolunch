import logger from "./logger";
import { Restaurant, Dish } from "./scraper";

import { v2 } from "@google-cloud/translate";

const translate = new v2.Translate({
  projectId: "devolunch",
});

export const translateText = async (
  from: string,
  to: string,
  originalText: Dish["description"]
) => {
  if (originalText && originalText.length > 0) {
    try {
      const [translation] = await translate.translate(originalText, {
        from,
        to,
      });
      return translation;
    } catch (err) {
      logger.error(err);
    }
  }
  return "";
};

const translateRestaurant = async (restaurant: Restaurant) => {
  restaurant.dishCollection.push({
    language: "en",
    dishes: await Promise.all(
      restaurant.dishCollection[0].dishes.map(async (dish) => ({
        ...dish,
        description: await translateText("sv", "en", dish.description),
      }))
    ),
  });
  return restaurant;
};

export let translateRestaurants = async (restaurants: Restaurant[]) =>
  await Promise.all(
    restaurants.map(
      async (restaurant: Restaurant) => await translateRestaurant(restaurant)
    )
  );
