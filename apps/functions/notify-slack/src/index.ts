import * as ff from '@google-cloud/functions-framework';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { Storage } from '@google-cloud/storage';

import { createConfig } from './config';

const config = createConfig();

const BUCKET_NAME = 'devolunchv2';

const storage = new Storage({
  projectId: 'devolunch',
});

const renderMarkdown = (restaurants: App.Restaurant[]) => {
  let result = '_English version below_\n\n';

  // Swedish
  restaurants.forEach((restaurant) => {
    result += renderItemForMarkdown('sv', restaurant);
  });

  // English
  result += '\n\n_English_\n---------------------\n\n';
  restaurants.forEach((restaurant) => {
    result += renderItemForMarkdown('en', restaurant);
  });

  result += '\n\n';
  return result;
};

const renderItemForMarkdown = (language: string, restaurant: App.Restaurant) => {
  let result = `*${restaurant.title}*\n\n`;
  const dishCollection = restaurant.dishCollection.find((dc: { language: string }) => dc.language === language);
  if (dishCollection?.dishes) {
    dishCollection.dishes.forEach((dish: App.Dish) => {
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
  return d.toISOString().split('T')[0];
};

ff.http('notify-slack', async (_: ff.Request, res: ff.Response) => {
  // send to slack
  const bucket = storage.bucket(BUCKET_NAME);
  const file = await bucket.file('scrape.json').download();
  const scrape = JSON.parse(file[0].toString('utf8'));

  const mdText = renderMarkdown(scrape.restaurants);

  const form = new FormData();
  form.append('initial_comment', 'https://www.malmolunch.se');
  form.append('content', mdText);
  form.append('channels', config.slackChannelId);
  form.append('title', `Lunch ${getTodayNiceFormat()}`);
  form.append('filetype', 'post');

  await fetch('https://slack.com/api/files.upload', {
    method: 'POST',
    body: form,
    headers: {
      Authorization: `Bearer ${config.slackOauthToken}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      return res.json();
    })
    .catch((err) => {
      console.error(err);
    });

  res.sendStatus(200);
});
