import { RestaurantMetaProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantMetaProps = {
  title: 'Saltimporten',
  url: 'https://www.saltimporten.com/',
  imageUrl: 'https://www.saltimporten.com/media/IMG_6253-512x512.jpg',
  googleMapsUrl: 'https://goo.gl/maps/9rn3svDPeGUDaeXUA',
  coordinate: {
    lat: 55.61608870967554,
    lon: 12.99710506088239,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString('sv-SE', {
        weekday: 'long',
      })
      .toLowerCase();

    const menu = document.querySelector('div[title="Page 1"]');
    const menuArray = (menu as HTMLElement)?.innerText?.split('\n').filter((a) => a.trim());

    const todayIndex = menuArray.findIndex((a) => a.normalize('NFC').toLowerCase() === todaySwedishFormat);
    const vegIndex = menuArray.findIndex((a) => a.normalize('NFC').toLowerCase().includes('veckans vegetariska'));

    return [
      {
        type: 'meat' as const,
        title: menuArray[todayIndex + 1],
      },
      {
        type: 'veg' as const,
        title: menuArray[vegIndex + 1],
      },
    ];
  });
