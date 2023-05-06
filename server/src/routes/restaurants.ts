import { Request, Response } from 'express';
import express from 'express';

import scrape from '../scraper';
import { getScrape } from '../services/storage';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  const scrape = await getScrape();

  res.send(scrape);
});

router.post('/', async (_: Request, res: Response) => {
  try {
    await scrape();
  } catch (err: unknown) {
    console.log(err);
    return res.sendStatus(500);
  }
  res.sendStatus(200);
});

export default router;
