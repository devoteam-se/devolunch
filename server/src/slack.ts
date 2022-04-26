import { Storage } from "@google-cloud/storage";
import fetch from "node-fetch";
import FormData from "form-data";
import { Restaurant, Dish } from "./scraper";
import logger from "./logger";

const BUCKET_NAME = "devolunch";

const storage = new Storage({
  projectId: "devolunch",
});

const renderMarkdown = (restaurants: Restaurant[]) => {
  let result = "https://lunch.jayway.com\n\n";
  restaurants
    .filter((item) => item.dishes.length > 0)
    .forEach((item) => {
      result += renderItemForMarkdown(item);
    });
  result += "\n\n";
  return result;
};

const renderItemForMarkdown = (item: Restaurant) => {
  const typeTranslation = {
    meat: "Kött",
    fish: "Fisk",
    veg: "Veg",
  };

  let result = `*${item.title}*\n\n`;
  if (item.dishes) {
    item.dishes.forEach((dish: Dish) => {
      result += `• ${typeTranslation[dish.type]}: ${dish.description}\n`;
    });
  }
  return result;
};

export default async () => {
  let d = new Date();
  const offset = d.getTimezoneOffset();
  d = new Date(d.getTime() - offset * 60 * 1000);
  const today = d.toISOString().split("T")[0];

  const bucket = storage.bucket(BUCKET_NAME);
  const file = await bucket.file("restaurants.json").download();
  const restaurants = JSON.parse(file[0].toString("utf8"));

  const compare = (a: Dish, b: Dish) => {
    const order = { veg: 1, fish: 2, meat: 3 };
    return order[a.type] - order[b.type];
  };

  const form = new FormData();
  form.append(
    "content",
    renderMarkdown(
      restaurants.map((r: Restaurant) => ({
        ...r,
        dishes: r.dishes.sort(compare),
      }))
    )
  );
  form.append("channels", process.env.SLACK_CHANNEL_ID);
  form.append("title", `Lunch ${today}`);
  form.append("filetype", "post");

  await fetch("https://slack.com/api/files.upload", {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${process.env.SLACK_OAUTH_TOKEN}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      return res.json();
    })
    .catch((err) => {
      logger.error(err);
    });
};
