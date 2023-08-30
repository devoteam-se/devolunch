import { RestaurantMetaProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantMetaProps = {
  title: 'Benne Pastabar',
  url: 'https://bennepastabar.se/',
  imageUrl: 'https://bennepastabar.se/wp-content/themes/benne/images/benne-pastabar-order.jpg',
  googleMapsUrl: 'https://goo.gl/maps/pZUg6zuXyy6xXxfn7',
  coordinate: {
    lat: 55.60313716015807,
    lon: 13.003559388316905,
  },
  unknownMealDefault: 'veg',
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const dishes = [...document.querySelectorAll('div.menu-wrapper h4')]
      .filter((topic) => topic?.textContent?.trim().length)
      .slice(0, -1)
      .map((topic) => ({
        title:
          topic.textContent && topic.textContent.charAt(0).toUpperCase() + topic.textContent.slice(1).toLowerCase(),
        description: topic.nextElementSibling?.textContent,
      }));

    return dishes;
  });
