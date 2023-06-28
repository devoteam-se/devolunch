import { Request, Response } from 'express';
import express from 'express';

import { getScrape } from '../services/storage';

const router = express.Router();

router.get('/', async (_: Request, res: Response) => {
  const scrape = await getScrape();

  res.send(scrape);
});

export default router;
