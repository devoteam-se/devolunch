import express from 'express';
const router = express.Router();

import restaurants from './restaurants';

router.get('/health', (req, res) => res.send("I'm healthy!"));
router.use('/restaurants', restaurants);

export default router;
