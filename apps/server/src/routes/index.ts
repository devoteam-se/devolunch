import express from 'express';
const router = express.Router();

import restaurants from './restaurants.js';

router.get('/health', (_, res) => res.send("I'm healthy!"));
router.use('/restaurants', restaurants);

export default router;
