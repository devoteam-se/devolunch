import { RestaurantMetaProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantMetaProps = {
  title: 'Two Forks',
  url: 'https://www.twoforks.se/lunch',
  imageUrl: 'https://images.squarespace-cdn.com/content/v1/5c6fc5858155121249a4c49f/d9867018-aaa7-4d7c-8a5b-b5f666277406/%C2%A9jensnordstromtwoforks0027.jpg',
  googleMapsUrl: 'https://maps.app.goo.gl/GKATv8jSGjbAKfYt5',
  coordinate: {
    lat: 55.6073278,
    lon: 12.9920499,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const nbrs = [1, 2, 3] as const;
    const types = { 1: 'vegan', 2: 'vegan', 3: 'meat' } as const;

    return nbrs.map(nbr => {
      const header = [...document.querySelectorAll('h2')].find(h => h.innerText === `NO. ${nbr}`);
      const title = (header?.nextElementSibling as HTMLParagraphElement)?.innerText.trim();

      return { type: types[nbr], title };
    });
  });
