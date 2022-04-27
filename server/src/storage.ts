import { Storage } from "@google-cloud/storage";
import { Scrape, Dish } from "./scraper";

const BUCKET_NAME = "devolunch";

const storage = new Storage({
  projectId: "devolunch",
});

export const getScrape = async () => {
  const bucket = storage.bucket(BUCKET_NAME);
  const file = await bucket.file("scrape.json").download();
  const scrape = JSON.parse(file[0].toString("utf8"));

  const compare = (a: Dish, b: Dish) => {
    const order = { veg: 1, fish: 2, meat: 3 };
    return order[a.type] - order[b.type];
  };

  return scrape.map((s: Scrape) => ({
    ...s,
    restaurants: s.restaurants.map((r) => ({
      ...r,
      dishes: r.dishes.sort(compare),
    })),
  }));
};

export const uploadScrape = async (scrape: Scrape) => {
  const bucket = storage.bucket(BUCKET_NAME);
  await bucket.file("scrape.json").save(JSON.stringify(scrape));
};
