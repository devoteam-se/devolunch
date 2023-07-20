import { RestaurantProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantProps = {
  title: 'Quanbyquan',
  url: 'https://quanbyquan.se/',
  imgUrl: 'https://quanbyquan.se/wp-content/uploads/2019/09/Quan_Recept_08-1.jpg',
  googleMapsUrl: 'https://goo.gl/maps/5xyoBjWuU9vUcD6V8',
  coordinate: {
    lat: 55.605634485935816,
    lon: 12.997834503074296,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const lunchNodes = [...document.querySelectorAll('div.food_category')];

    if (!lunchNodes) {
      return [];
    }

    const lunchNode = lunchNodes
      .find((m) => m.querySelector('h2')?.innerText.includes('Lunch menu'))
      ?.querySelectorAll('div.row');

    if (!lunchNode) {
      return [];
    }

    return [...lunchNode]
      .map((a) => (a as HTMLElement).innerText.split('\n').filter((a: string) => a.length && !/^\d{3}:-$/.test(a)))
      .map((row, index) => {
        const [title, desc] = row;
        const lunch = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase() + ' - ' + desc;

        const types = ['misc', 'meat', 'fish', 'meat', 'veg', 'fish'];

        return {
          type: types[index],
          title: lunch,
        };
      });
  });
