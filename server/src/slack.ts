import fetch from "node-fetch";
import FormData from "form-data";
import { Restaurant, Dish } from "./scraper";
import logger from "./logger";
import { getScrape } from "./storage";
import { translateRestaurants } from "./translator";

const renderMarkdown = async (restaurants: Restaurant[]) => {
  let result = "https://lunch.jayway.com (_English version below_)\n\n";

  restaurants = restaurants.filter((item) => item.dishes.length > 0);

  restaurants
    .forEach((item) => {
      result += renderItemForMarkdown(item);
    });
  result += "\n\n*_English_*\n\n";

  // EN
  (await translateRestaurants(restaurants))
    .forEach((item) => {
      result += renderItemForMarkdown(item);
    });
  result += "\n\n";
  return result;
};

const renderItemForMarkdown = (item: Restaurant) => {
  let result = `*${item.title}*\n\n`;
  if (item.dishes) {
    item.dishes.forEach((dish: Dish) => {
      // Capitalize type
      result += `• ${dish.type.replace(/\b\w/g, (l) => l.toUpperCase())}: ${
        dish.description
      }\n`;
    });
  }
  return result;
};

const getTodayNiceFormat = () => {
  let d = new Date();
  const offset = d.getTimezoneOffset();
  d = new Date(d.getTime() - offset * 60 * 1000);
  return d.toISOString().split("T")[0];
};

export default async () => {
  const restaurants = await getScrape();

  const form = new FormData();
  form.append("content", renderMarkdown(restaurants.restaurants));
  form.append("channels", process.env.SLACK_CHANNEL_ID);
  form.append("title", `Lunch ${getTodayNiceFormat()}`);
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
