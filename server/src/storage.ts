import { Storage } from "@google-cloud/storage";
import { Restaurant, Dish } from "./scraper";

const BUCKET_NAME = "devolunch";

const storage = new Storage({
  projectId: "devolunch",
});

export const getRestaurants = async () => {
  const bucket = storage.bucket(BUCKET_NAME);
  const file = await bucket.file("restaurants.json").download();
  const restaurants = JSON.parse(file[0].toString("utf8"));

  const compare = (a: Dish, b: Dish) => {
    const order = { veg: 1, fish: 2, meat: 3 };
    return order[a.type] - order[b.type];
  };

  return restaurants.map((r: Restaurant) => ({
    ...r,
    dishes: r.dishes.sort(compare),
  }));
};

export const uploadRestaurants = async (restaurants: Restaurant[]) => {
  const bucket = storage.bucket(BUCKET_NAME);
  await bucket.file("restaurants.json").save(JSON.stringify(restaurants));
};
