import { RestaurantMetaProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantMetaProps = {
  title: 'Kontrast Västra Hamnen',
  url: 'https://www.kontrastrestaurang.se/vastra-hamnen/',
  imageUrl:
    'https://usercontent.one/wp/www.kontrastrestaurang.se/wp-content/uploads/2022/08/Indian-food-hero.jpg?media=1666955164',
  googleMapsUrl: 'https://goo.gl/maps/sAfGLCky4RcSUZKw5',
  coordinate: {
    lat: 55.610228873034714,
    lon: 12.973623667388564,
  },
  unknownMealDefault: 'veg',
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const getDishes = (type: string, knownType: string | null = null) => {
      const topic = [...document.querySelectorAll('h2')].find((a) =>
        a.textContent?.toLowerCase().includes(type.toLowerCase()),
      );
      const dishes =
        ((topic?.parentNode?.parentNode as HTMLElement)?.nextElementSibling as HTMLElement)?.innerText
          ?.split('\n')
          .filter((a) => a) || [];

      return dishes.map((dish: string) => ({
        title: type + ' - ' + dish.replace(/[0-9]+\.\s/, ''),
        ...(knownType && { type: knownType }),
      }));
    };

    const chickenDishes = getDishes('Kyckling', 'meat');
    const beefDishes = getDishes('Biff', 'meat');
    const vegDishes = getDishes('Vegetarisk');

    const dishes = [...chickenDishes, ...beefDishes, ...vegDishes];

    return dishes;
  });
