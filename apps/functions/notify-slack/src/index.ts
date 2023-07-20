import * as ff from '@google-cloud/functions-framework';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { Storage } from '@google-cloud/storage';
import { DishCollectionProps, RestaurantProps } from '@devolunch/shared';
import { createConfig } from './config';

const BUCKET_NAME = 'devolunchv2';

const config = createConfig();
const storage = new Storage({
  projectId: 'devolunch',
});

const renderMarkdown = (restaurants: RestaurantProps[]) => {
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

const renderItemForMarkdown = (language: string, { title, dishCollection }: RestaurantProps): string => {
  let result = `*${title}*\n\n`;
  const dishCollectionForLanguage = dishCollection?.find((dc: { language: string }) => dc.language === language);
  if (dishCollectionForLanguage?.dishes) {
    if (!dishCollectionForLanguage.dishes.length) {
      result += '• Closed or :shrug:\n';
    }
    for (const dish of dishCollectionForLanguage.dishes) {
      result += `• ${dish?.type?.replace(/\b\w/g, (l) => l.toUpperCase())}: ${dish.title}\n`;
    }
  }
  return result;
};

const getTodayNiceFormat = (): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

ff.http('notify-slack', async (_: ff.Request, res: ff.Response) => {
  // send to slack
  const bucket = storage.bucket(BUCKET_NAME);
  const file = await bucket.file('scrape.json').download();
  const scrape = JSON.parse(file[0].toString('utf8'));

  const sortedRestaurants = scrape.restaurants.sort(
    (a: RestaurantProps, b: RestaurantProps) =>
      (b.dishCollection?.filter((d: DishCollectionProps) => d.dishes?.length).length || 0) -
        (a.dishCollection?.filter((d: DishCollectionProps) => d.dishes?.length).length || 0) ||
      (a.distance && b.distance ? a.distance - b.distance : 0),
  );

  const mdText = renderMarkdown(sortedRestaurants);

  const form = new FormData();
  form.append('initial_comment', 'https://www.malmolunch.se');
  form.append('content', mdText);
  form.append('channels', config.slackChannelId);
  form.append('title', `Lunch ${getTodayNiceFormat()}`);
  form.append('filetype', 'post');

  try {
    const response = await fetch('https://slack.com/api/files.upload', {
      method: 'POST',
      body: form,
      headers: {
        Authorization: `Bearer ${config.slackOauthToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Server error ${response.status}`);
    }
  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});
