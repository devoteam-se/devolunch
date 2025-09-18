import dotenv from 'dotenv';

// Load env only for truly dynamic/sensitive values (e.g., NODE_ENV)
dotenv.config();

// Keep configuration simple and mostly constant. Only NODE_ENV affects behavior.
export const config = {
  development: process.env.NODE_ENV === 'development',
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'sv',
  translateLanguages: process.env.TRANSLATE_LANGUAGES || 'en',
  useContentCleaner: process.env.USE_CONTENT_CLEANER !== 'false', // Default to true, can be disabled
} as const;

export type Config = typeof config;
