import { EnvType, load } from "ts-dotenv";

export type Env = EnvType<typeof schema>;

export const schema = {
  NODE_ENV: String,
  SLACK_OAUTH_TOKEN: String,
  SLACK_CHANNEL_ID: String,
};

export let env: Env;

export function loadEnv(): void {
  env = load(schema);
}
