import { Request, Response, Express } from "express";
import scrape from "./scraper";
import slack from "./slack";
import { getRestaurants } from "./storage";

export default ({ app }: { app: Express }) => {
  app.get("/api", (req, res) => {
    res.send("Hello API");
  });

  app.get("/api/restaurants", async (req, res) => {
    const restaurants = await getRestaurants();
    res.send(restaurants);
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
