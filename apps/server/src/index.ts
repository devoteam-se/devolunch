import express, { Request, Response } from 'express';
import { resolve } from 'path';
import cors from 'cors';
import compression from 'compression';

import { config } from './config';
import { logger } from '@devolunch/shared';
import routes from './routes';

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
