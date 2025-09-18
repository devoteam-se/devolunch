import { z } from 'zod';
import dotenv from 'dotenv';

const ConfigSchema = z
  .object({
    development: z.boolean(),
    slackChannelId: z.string().min(1),
    slackOauthToken: z.string().min(1),
  })
  .strict();

export type Config = z.infer<typeof ConfigSchema>;

export const createConfig = () => {
  dotenv.config();

  const config = ConfigSchema.parse({
    development: process.env.NODE_ENV === 'development',
    slackChannelId: process.env.SLACK_CHANNEL_ID || '',
    slackOauthToken: process.env.SLACK_OAUTH_TOKEN || '',
  });

  return ConfigSchema.parse(config);
};
