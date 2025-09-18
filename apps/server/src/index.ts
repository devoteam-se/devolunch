import express from 'express';
import type { Request, Response } from 'express';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import compression from 'compression';

import { config } from './config.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLIENT_DIR = resolve(__dirname, '..', '..', 'client');

const app = express();

app.use(
  compression({
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 0,
  }),
);

app.use(cors());

app.use(express.static(resolve(CLIENT_DIR, 'dist')));

app.get('/', (_, res) => {
  res.sendFile(resolve(CLIENT_DIR, 'dist', 'index.html'));
});

app.use('/api/v1', routes);

app.listen(config.port, () => {
  logger.info(`App listening on port ${config.port}`);
});
