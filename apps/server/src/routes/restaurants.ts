import express from 'express';
import type { Request, Response, Router } from 'express';

import { getScrape } from '../services/storage';

const router: Router = express.Router();

router.get('/', async (_: Request, res: Response) => {
  const scrape = await getScrape();

  res.send(scrape);
});

export default router;
