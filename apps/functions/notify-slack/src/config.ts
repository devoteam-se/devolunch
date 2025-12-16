import { z } from 'zod';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ConfigSchema = z
  .object({
    development: z.boolean(),
    slackChannelId: z.string().min(1),
    slackOauthToken: z.string().min(1),
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;

export const createConfig = () => {
  // Load .env file from the correct location (one level up from dist)
  const envPath = join(__dirname, '..', '.env');
  dotenv.config({ path: envPath });

  const config = ConfigSchema.parse({
    development: process.env.NODE_ENV === 'development',
    slackChannelId: process.env.SLACK_CHANNEL_ID || '',
    slackOauthToken: process.env.SLACK_OAUTH_TOKEN || '',
  });

  return config;
};
