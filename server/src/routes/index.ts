import express from 'express';
const router = express.Router();

import restaurants from './restaurants';

router.use('/restaurants', restaurants);

export default router;
