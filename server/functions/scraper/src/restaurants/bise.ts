import { Page } from 'puppeteer';
import pdf from 'pdf-parse';

export const meta = {
  title: 'BISe',
  url: 'https://bise.se/lunch',
  imgUrl:
    'https://bise.se/_next/image?url=https%3A%2F%2Fcms.bise.se%2Fwp-content%2Fuploads%2F2022%2F10%2FLunch_Bise.jpeg&w=1080&q=75',
  googleMapsUrl: 'https://goo.gl/maps/9hmQUctdgeNvVSuF8',
  latitude: 55.60675917303053,
  longitude: 12.996173056055413,
  pdf: true,
};

export const browserScrapeFunction = async (page: Page) =>
  page.evaluate(async () => {
    const lunchNode = [...document.querySelectorAll('a')].find((a) =>
      a?.innerText?.toLowerCase()?.includes('veckans lunchmeny'),
    );
    const url = lunchNode?.getAttribute('href');

    if (!url) {
      return [];
    }

    return url;
  });

export const pdfScrapeFunction = async (url: string) => {
  const todaySwedishFormat = new Date()
    .toLocaleString('sv-SE', {
      weekday: 'long',
    })
    .toLowerCase();

  const f = await fetch(url);
  const buffer = await f.arrayBuffer();
  const pdfData = await pdf(Buffer.from(buffer));

  const raw = pdfData.text
    .split('\n')
    .map((a: string) =>
      a
        .replace(/ {2}|\r\n|\n|\r/gm, '')
        .replace('’', '')
        .trim(),
    )
    .filter((a: string) => a && !a.startsWith('Warning'));

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const todayMeatIndex = raw.findIndex((a: string) => a.toLowerCase().includes(todaySwedishFormat));
  const vegIndex = raw.findIndex((a: string) => a.toLowerCase().includes('veckans vegetariska'));

  const todayMeat = {
    type: 'meat' as const,
    description: capitalizeFirstLetter(raw[todayMeatIndex + 1]),
  };

  const veg = {
    type: 'veg' as const,
    description: capitalizeFirstLetter(raw[vegIndex + 1]),
  };

  return [todayMeat, veg];
};
