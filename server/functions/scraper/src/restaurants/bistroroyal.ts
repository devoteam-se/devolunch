import { Page } from 'puppeteer';

export const meta = {
  title: 'Bistro Royal',
  url: 'https://bistroroyal.se/dagens-ratt/',
  imgUrl: 'https://cdn42.gastrogate.com/files/29072/bistroroyal-bistro-1-1.jpg',
  googleMapsUrl: 'https://goo.gl/maps/hSqYWPKgWVbSRj2s7',
  latitude: 55.608996491841665,
  longitude: 12.999521057744403,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString('sv-SE', {
        weekday: 'long',
      })
      .toLowerCase();

    const lunchNode = [...document.querySelectorAll('.menu_header')]?.find((e) =>
      e.textContent?.toLowerCase()?.includes(todaySwedishFormat),
    );
    const lunchMenuDiv = lunchNode?.parentNode?.parentNode as HTMLElement;
    const htmlElement = lunchMenuDiv?.nextElementSibling as HTMLElement;
    const raw = htmlElement ? [...htmlElement.querySelectorAll('.td_title')]?.map((e) => e.textContent?.trim()) : [];

    const typeArray = ['meat' as const, 'meat' as const, 'fish' as const, 'veg' as const];

    return raw.map((e, i) => ({
      type: typeArray[i],
      description: e,
    }));
  });
