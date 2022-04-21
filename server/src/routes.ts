import { Request, Response, Express } from "express";
import scrape from "./scraper";

export default ({ app }: { app: Express }) => {
  app.post("/api/restaurants", async (_: Request, res: Response) => {
    await scrape();
    res.sendStatus(200);
  });
};
