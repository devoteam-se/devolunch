import { Page } from 'puppeteer';
import { DishType, RestaurantMetaProps } from '@devolunch/shared';

export const meta: RestaurantMetaProps = {
  title: 'MiaMarias',
  url: 'http://www.miamarias.nu/',
  imageUrl: 'https://i0.wp.com/www.takemetosweden.be/wp-content/uploads/2019/07/MiaMarias-Malm%C3%B6-1.png?w=500&ssl=1',
  googleMapsUrl: 'https://goo.gl/maps/RrRffZzgebREQpwB7',
  coordinate: {
    lat: 55.613464681883094,
    lon: 12.992134201401216,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const dayOfWeek = new Date().getDay();
    const tables = Array.from(document.querySelectorAll('table'));
    const raw =
      tables
        .slice(dayOfWeek - 1, dayOfWeek)
        .pop()
        ?.querySelector('tbody')
        ?.textContent?.split('\n')
        .filter((e: string) => e.trim()) || [];

    const dishes = [];

    for (let i = 0; i < raw.length; i += 2) {
      const swedishType = raw[i]
        .match(/^[^0-9]+/)
        ?.shift()
        ?.trim();
      const type: DishType = swedishType === 'Fisk' ? 'fish' : swedishType === 'Kött' ? 'meat' : 'veg';

      const price = Number(raw[i].match(/([0-9]+)\s?kr/)?.slice(1, 2));
      const title = raw[i + 1];
      dishes.push({ type, price, title });
    }
    return dishes;
  });
