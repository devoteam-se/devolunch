import { Page } from 'puppeteer';
import fishes from '../data/fishes.js';

export const meta = {
  title: 'Smak',
  url: 'https://gastrogate.com/lunch/print/6005',
  imgUrl: 'https://smak.info/wp-content/uploads/2022/05/IMG_2946-kall-1024x768.png',
  googleMapsUrl: 'https://goo.gl/maps/5NrVf9rA3gocZLvd7',
  latitude: 55.59505322449918,
  longitude: 12.999231400154716,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate((fishes) => {
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

    const fishIndex = meals.findIndex((meal) => fishes.some((fish) => meal.toLowerCase().includes(fish)));

    const dishes = [];

    if (fishIndex !== -1) {
      dishes.push({
        type: 'fish' as const,
        description: meals[fishIndex],
      });
      meals.splice(fishIndex, 1);
    }

    dishes.push(
      ...meals.map((meal) => ({
        type: 'misc' as const,
        description: meal,
      })),
    );

    return dishes;
  }, fishes);
