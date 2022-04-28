import logger from "./logger";
import { Restaurant, Dish } from "./scraper";

import { v2 } from '@google-cloud/translate';

const translate = new v2.Translate({
    projectId: "devolunch",
});

const translateSv2en = async (swedishText: Dish['description']) => {
    if (swedishText && swedishText.length > 1) {
        try {
            const [englishText] = await translate.translate(swedishText, { from: "sv", to: "en" });
            return englishText;
        } catch (err) {
            logger.error(err);
        }
    }
    return ""
};

export let translateRestaurants =
    async (restaurants: Restaurant[]) => Promise.all(
        restaurants.map(async restaurant => ({
            ...restaurant,
            dishes: await Promise.all(restaurant.dishes.map(async dish => ({
                ...dish,
                description: await translateSv2en(dish.description)
            }))
            )
        })));