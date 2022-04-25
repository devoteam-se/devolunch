import { ErrorCode, WebClient } from "@slack/web-api";

const client = new WebClient(process.env.SLACK_OAUTH_TOKEN);

export default async () => {
  try {
    let d = new Date();
    const offset = d.getTimezoneOffset();
    d = new Date(d.getTime() - offset * 60 * 1000);
    const today = d.toISOString().split("T")[0];

    await client.files.upload({
      channel: process.env.SLACK_CHANNEL_ID,
      filetype: "text",
      title: `Lunch ${today}`,
      content: "Hello world!", // TODO: add payload here
    });
  } catch (error: any) {
    if (error.code === ErrorCode.PlatformError) {
      console.log(error.data);
    } else {
      console.log("Well, that was unexpected.");
    }
  }
};
