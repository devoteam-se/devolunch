import { Request, Response, Express } from "express";
import { Storage } from "@google-cloud/storage";

import scrape, { Dish, Restaurant } from "./scraper";
import slack from "./slack";

const BUCKET_NAME = "devolunch";

const storage = new Storage({
  projectId: "devolunch",
});

export default ({ app }: { app: Express }) => {
  app.get("/api", (req, res) => {
    res.send("Hello API");
  });

  app.get("/api/restaurants", async (req, res) => {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = await bucket.file("restaurants.json").download();
    const restaurants = JSON.parse(file[0].toString("utf8"));

    const compare = (a: Dish, b: Dish) => {
      const order = { veg: 1, fish: 2, meat: 3 };
      return order[a.type] - order[b.type];
    };

    res.send(
      restaurants.map((r: Restaurant) => ({
        ...r,
        dishes: r.dishes.sort(compare),
      }))
    );
  });

  app.post("/api/restaurants", async (_: Request, res: Response) => {
    try {
      await scrape();
    } catch (err: unknown) {
      return res.sendStatus(500);
    }
    res.sendStatus(200);
  });

  app.post("/api/slack", async (_: Request, res: Response) => {
    try {
      await slack();
    } catch (err: unknown) {
      return res.sendStatus(500);
    }
    res.sendStatus(200);
  });
};
