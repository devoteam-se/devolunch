import express from 'express';
const router = express.Router();

import slack from './slack';
import restaurants from './restaurants';

router.use('/slack', slack);
router.use('/restaurants', restaurants);

export default router;
