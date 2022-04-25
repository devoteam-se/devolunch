import { Request, Response, Express } from "express";
import { Storage } from "@google-cloud/storage";

import scrape from "./scraper";
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
    res.send(JSON.parse(file[0].toString("utf8")));
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
