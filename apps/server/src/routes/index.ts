import express from 'express';
import type { Router } from 'express';
const router: Router = express.Router();

import restaurants from './restaurants.js';

router.get('/health', (_, res) => res.send("I'm healthy!"));
router.use('/restaurants', restaurants);

export default router;
