import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const ConfigSchema = z
  .object({
    development: z.boolean(),
    port: z.number(),
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;

export const config = ConfigSchema.parse({
  development: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT || '8080', 10),
});
