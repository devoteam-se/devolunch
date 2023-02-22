import fetch from "node-fetch";
import FormData from "form-data";

import logger from "../logger";
import { getScrape } from "../services/storage";
import { env } from "../env";

const renderMarkdown = (restaurants: Restaurant[]) => {
  let result = "";

  // Swedish
  restaurants.forEach((restaurant) => {
    result += renderItemForMarkdown("sv", restaurant);
  });

  // English
  result += "\n\n_English_\n---------------------\n\n";
  restaurants.forEach((restaurant) => {
    result += renderItemForMarkdown("en", restaurant);
  });

  result += "\n\n";
  return result;
};

const renderItemForMarkdown = (language: string, restaurant: Restaurant) => {
  let result = `*${restaurant.title}*\n\n`;
  const dishCollection = restaurant.dishCollection.find((dc: { language: string }) => dc.language === language);
  if (dishCollection?.dishes) {
    dishCollection.dishes.forEach((dish: Dish) => {
      // Capitalize type
      result += `• ${dish.type.replace(/\b\w/g, (l) => l.toUpperCase())}: ${dish.description}\n`;
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
  const scrape = await getScrape();
  const mdText = renderMarkdown(scrape.restaurants);

  const form = new FormData();
  form.append("initial_comment", "https://www.malmolunch.se (_English version below_)");
  form.append("content", mdText);
  form.append("channels", env.SLACK_CHANNEL_ID);
  form.append("title", `Lunch ${getTodayNiceFormat()}`);
  form.append("filetype", "post");

  await fetch("https://slack.com/api/files.upload", {
    method: "POST",
    body: form,
    headers: {
      Authorization: `Bearer ${env.SLACK_OAUTH_TOKEN}`,
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
