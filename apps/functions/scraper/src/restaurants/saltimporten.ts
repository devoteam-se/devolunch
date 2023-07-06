import { Page } from 'puppeteer';

export const meta = {
  title: 'Saltimporten',
  url: 'https://www.saltimporten.com/',
  imgUrl: 'https://www.saltimporten.com/media/IMG_6253-512x512.jpg',
  googleMapsUrl: 'https://goo.gl/maps/9rn3svDPeGUDaeXUA',
  latitude: 55.61608870967554,
  longitude: 12.99710506088239,
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
        description: menuArray[todayIndex + 1],
      },
      {
        type: 'veg' as const,
        description: menuArray[vegIndex + 1],
      },
    ];
  });
