import { Request, Response } from "express";
import express from "express";

import scrape from "../scraper";
import { getScrape } from "../services/storage";
import { distance } from "../scraper/distance";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const scrape = await getScrape();

  console.log(JSON.stringify(scrape));

  const { query } = req;
  const latitude: number = parseFloat(query.latitude as string);
  const longitude: number = parseFloat(query.longitude as string);

  scrape.restaurants = scrape.restaurants
    .map((r: { latitude: number; longitude: number }) => ({
      ...r,
      distance: distance(latitude, r.latitude, longitude, r.longitude),
    }))
    .sort((a: Restaurant, b: Restaurant) => a.distance - b.distance);

  res.send(scrape);
});

router.post("/", async (_: Request, res: Response) => {
  try {
    await scrape();
  } catch (err: unknown) {
    console.log(err);
    return res.sendStatus(500);
  }
  res.sendStatus(200);
});

export default router;
