import { RestaurantMetaProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantMetaProps = {
  title: 'Spill',
  url: 'https://restaurangspill.se/',
  imageUrl: 'https://restaurangspill.se/static/0de07c5b4f98bc003befad5e872686b4/9bbaf/SPILL_09.jpg',
  googleMapsUrl: 'https://goo.gl/maps/bZ8yDN3PD3fjvNGw5',
  coordinate: {
    lat: 55.612746399457436,
    lon: 12.988458042546734,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const dishesNodes = [...document.querySelectorAll('div h2')].find(
      (a) => a.textContent?.toLowerCase() === 'dagens lunch',
    )?.nextElementSibling?.childNodes[0].childNodes[1].childNodes[1].textContent;

    const a = dishesNodes?.split(/Vegetariskt?:/gm);
    const meat = a?.[0]?.replace(/(\r\n|\n|\r)/gm, ' ').trim();
    const veg = a?.[1]?.replace(/(\r\n|\n|\r)/gm, ' ').trim();

    return [
      {
        type: 'meat' as const,
        title: meat,
      },
      {
        type: 'veg' as const,
        title: veg,
      },
    ];
  });
