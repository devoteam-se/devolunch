import { z } from 'zod';
import dotenv from 'dotenv';

const ConfigSchema = z
  .object({
    development: z.boolean(),
    defaultLanguage: z.string().min(1),
    translateLanguages: z.string().min(1),
    filesOverride: z.string().optional(),
    maxConcurrentFiles: z.number().int().positive().optional(),
    maxConcurrentRestaurants: z.number().int().positive().optional(),
    useContentCleaner: z.boolean().optional(),
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;

export const createConfig = () => {
  dotenv.config();

  const config = ConfigSchema.parse({
    development: process.env.NODE_ENV === 'development',
    defaultLanguage: process.env.DEFAULT_LANGUAGE || '',
    translateLanguages: process.env.TRANSLATE_LANGUAGES || '',
    filesOverride: process.env.FILES_OVERRIDE || undefined,
    maxConcurrentFiles: process.env.MAX_CONCURRENT_FILES ? parseInt(process.env.MAX_CONCURRENT_FILES) : 3,
    maxConcurrentRestaurants: process.env.MAX_CONCURRENT_RESTAURANTS
      ? parseInt(process.env.MAX_CONCURRENT_RESTAURANTS)
      : 5,
    useContentCleaner: process.env.USE_CONTENT_CLEANER === 'true', // Default to false, enable only when explicitly set
  });

  return ConfigSchema.parse(config);
};
