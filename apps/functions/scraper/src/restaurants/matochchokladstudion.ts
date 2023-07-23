import { RestaurantMetaProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantMetaProps = {
  title: 'Mat- & chokladstudion',
  url: 'https://www.matochchokladstudion.se/lunch',
  imageUrl: 'https://mars-images.imgix.net/1674755786595?auto=compress&fit=clip&dpr=1.5&fit=clip&w=600&h=600',
  googleMapsUrl: 'https://goo.gl/maps/nPPTDtCfozCqwfbP8',
  coordinate: {
    lat: 55.60008037302816,
    lon: 13.00792098489051,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString('sv-SE', {
        weekday: 'long',
      })
      .toLowerCase();

    const lunchNode = [...document.querySelectorAll('p')].find((a) => a.innerText?.toLowerCase().includes('lunchmeny'));

    const lunchMenuDiv = lunchNode?.parentNode as HTMLDivElement;
    const raw = lunchMenuDiv.innerText.split('\n').filter((a) => a.trim());
    const todayIndex = raw.findIndex((a) => a.toLowerCase() === todaySwedishFormat);
    const saladIndex = raw.findIndex((a) => a.toLowerCase().includes('veckans sallad'));

    return [
      {
        type: 'veg' as const,
        title: raw[todayIndex + 1],
      },
      {
        type: 'misc' as const,
        title: raw[saladIndex + 1],
      },
    ];
  });
