import { z } from 'zod';
import dotenv from 'dotenv';

const Config = z
  .object({
    development: z.boolean(),
    defaultLanguage: z.string().min(1),
    translateLanguages: z.string().min(1),
    filesOverride: z.string().optional(),
  })
  .strict();

export type Config = z.infer<typeof Config>;

export const createConfig = () => {
  dotenv.config();

  const config = Config.parse({
    development: process.env.NODE_ENV === 'development',
    defaultLanguage: process.env.DEFAULT_LANGUAGE || '',
    translateLanguages: process.env.TRANSLATE_LANGUAGES || '',
    filesOverride: process.env.FILES_OVERRIDE || undefined,
  });

  return Config.parse(config);
};
