import { RestaurantProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantProps = {
  title: 'Smak',
  url: 'https://gastrogate.com/lunch/print/6005',
  imgUrl: 'https://smak.info/wp-content/uploads/2022/05/IMG_2946-kall-1024x768.png',
  googleMapsUrl: 'https://goo.gl/maps/5NrVf9rA3gocZLvd7',
  coordinate: {
    lat: 55.59505322449918,
    lon: 12.999231400154716,
  },
  unknownMealDefault: 'veg',
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString('sv-SE', {
        weekday: 'long',
      })
      .toLowerCase();

    const lunchNode = document.querySelector('div.lunch-container') as HTMLElement;
    const lunchArray = lunchNode?.innerText?.split('\n')?.filter((a) => !/^\d{3} kr$/.test(a));
    const todayIndex = lunchArray?.findIndex((a) => a.toLowerCase().normalize('NFC').includes(todaySwedishFormat));

    if (!lunchArray?.length) {
      return [];
    }

    const meals = [lunchArray[todayIndex + 1], lunchArray[todayIndex + 2], lunchArray[todayIndex + 3]];

    return meals.map((meal) => ({
      title: meal,
    }));
  });
