import { Page } from 'puppeteer';
import pdf from 'pdf-parse';

export const meta = {
  title: 'Kitchen & Table',
  url: 'https://kitchenandtable.se/sv/malmo/',
  imgUrl: 'https://kitchenandtable.se/wp-content/uploads/2018/11/kitchentable.jpg',
  googleMapsUrl: 'https://goo.gl/maps/VDSp4ho4fF4n5FLa7',
  latitude: 55.60773255254585,
  longitude: 12.994298527220163,
};

export const pdfScrapeFunction = async (url: string) => {
  if (!url) {
    return [];
  }

  const todayEnglishFormat = new Date()
    .toLocaleString('en-GB', {
      weekday: 'long',
    })
    .toLowerCase();

  const f = await fetch(url);
  const buffer = await f.arrayBuffer();
  const pdfData = await pdf(Buffer.from(buffer));

  const raw = pdfData.text
    .split('\n')
    .map((a: string) => a.replace(/ {2}|\r\n|\n|\r/gm, '').trim())
    .filter((a: string) => a && !a.startsWith('Warning'));

  const getFullMenuItem = (raw: string[], index: number) => {
    if (raw[index + 1].slice(-1) === ',') {
      return `${raw[index + 1]} ${raw[index + 2]}`;
    }
    return raw[index + 1];
  };

  const todayMeatIndex = raw.findIndex((a: string) => a.toLowerCase().includes(todayEnglishFormat));
  const vegIndex = raw.findIndex((a: string) => a.toLowerCase().includes('vegetarian'));
  const saladIndex = raw.findIndex((a: string) => a.toLowerCase().includes('weekly salad'));

  const todayMeat = {
    type: 'meat' as const,
    description: getFullMenuItem(raw, todayMeatIndex),
  };

  const veg = {
    type: 'veg' as const,
    description: getFullMenuItem(raw, vegIndex),
  };

  const salad = {
    type: 'misc' as const,
    description: getFullMenuItem(raw, saladIndex),
  };

  return [todayMeat, veg, salad];
};

export const browserScrapeFunction = async (page: Page) => {
  const url = await page.evaluate(async () => {
    const lunchNode = [...document.querySelectorAll('a')].find((a) => a?.innerText?.toLowerCase()?.includes('lunch'));
    const url = lunchNode?.getAttribute('href');

    if (!url) {
      return '';
    }

    return url;
  });

  return pdfScrapeFunction(url);
};
