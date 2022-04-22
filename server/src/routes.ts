import { Request, Response, Express } from "express";
import { Storage } from "@google-cloud/storage";

import scrape from "./scraper";

const BUCKET_NAME = "devolunch";

const storage = new Storage({
  projectId: 'devolunch',
});

export default ({ app }: { app: Express }) => {
  app.get("/api", (req, res) => {
    res.send("Hello API");
  });

  app.get("/api/restaurants", async (req, res) => {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = await bucket
      .file("restaurants.json")
      .download();
    res.send(JSON.parse(file[0].toString('utf8')));
  });

  app.post("/api/restaurants", async (_: Request, res: Response) => {
    try {
      await scrape();
    } catch (err: any) {
      return res.status(500).send(err.message);
    }
    res.sendStatus(200);
  });
};
