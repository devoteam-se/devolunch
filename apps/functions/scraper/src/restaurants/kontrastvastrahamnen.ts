import { Page } from 'puppeteer';

export const meta = {
  title: 'Kontrast Västra Hamnen',
  url: 'https://www.kontrastrestaurang.se/vastra-hamnen/',
  imgUrl:
    'https://usercontent.one/wp/www.kontrastrestaurang.se/wp-content/uploads/2022/08/Indian-food-hero.jpg?media=1666955164',
  googleMapsUrl: 'https://goo.gl/maps/sAfGLCky4RcSUZKw5',
  latitude: 55.610228873034714,
  longitude: 12.973623667388564,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const getDishes = (type: string) => {
      const topic = [...document.querySelectorAll('h2')].find((a) =>
        a.textContent?.toLowerCase().includes(type.toLowerCase()),
      );
      const dishes =
        ((topic?.parentNode?.parentNode as HTMLElement)?.nextElementSibling as HTMLElement)?.innerText
          ?.split('\n')
          .filter((a) => a) || [];

      return dishes.map((dish: string) => ({
        type: type === 'Vegetarisk' ? 'veg' : 'meat',
        title: type + ' - ' + dish.replace(/[0-9]+\.\s/, ''),
      }));
    };

    const chickenDishes = getDishes('Kyckling');
    const beefDishes = getDishes('Biff');
    const vegDishes = getDishes('Vegetarisk');

    return [...chickenDishes, ...beefDishes, ...vegDishes];
  });
