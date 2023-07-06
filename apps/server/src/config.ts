import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const Config = z
  .object({
    development: z.boolean(),
    port: z.number(),
  })
  .strict();

export type Config = z.infer<typeof Config>;

export const config = Config.parse({
  development: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT || '8080', 10),
});
