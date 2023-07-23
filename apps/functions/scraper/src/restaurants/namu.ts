import { RestaurantMetaProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantMetaProps = {
  title: 'Namu',
  url: 'https://namu.nu/',
  imageUrl: 'https://namu.nu/wp-content/uploads/2017/05/Namul-darker2-3k-min.jpg',
  googleMapsUrl: 'https://goo.gl/maps/XtFUKSvmDQTUpR146',
  coordinate: {
    lat: 55.605198570165165,
    lon: 12.997516926554482,
  },
  unknownMealDefault: 'veg',
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('ul.fdm-section-lunch-pa-namu li')]
      .map((meal) =>
        (meal as HTMLElement).innerText
          .split('\n')
          .map((b) => {
            return b.replace(/\r\n|\n|\r|\t/gm, '');
          })
          .filter((b) => b.length),
      )
      .slice(1)
      .slice(0, -1)
      .map((meal) => {
        const title = meal[0];
        meal.shift();
        const description = meal.join(' ');
        return {
          title: title.charAt(0).toUpperCase() + title.slice(1).toLowerCase(),
          description,
        };
      }),
  );
