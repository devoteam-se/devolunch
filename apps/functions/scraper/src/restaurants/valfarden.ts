import { RestaurantMetaProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantMetaProps = {
  title: 'Välfärden',
  url: 'https://valfarden.nu/dagens-lunch/',
  imageUrl: 'https://valfarden.nu/wp-content/uploads/2015/01/hylla.jpg',
  googleMapsUrl: 'https://goo.gl/maps/cLAKuD2B95N8bqr19',
  coordinate: {
    lat: 55.61123819992324,
    lon: 12.994400413711007,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString('sv-SE', {
        weekday: 'long',
      })
      .toLowerCase();

    const lunchNode = [...document.querySelectorAll('p, h2, h3')].find((a) =>
      new RegExp(/vecka\s([1-9][0-9]?(\.[0-9]{1,2})?)/).test((a as HTMLElement)?.innerText.toLowerCase()),
    );

    const weekdays = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag'];
    let closestParentElement = lunchNode as HTMLElement;

    while (true as const) {
      // If we find 3 or more weekdays in the parentElement we're gucci
      if (weekdays.filter((w) => closestParentElement?.textContent?.toLowerCase().includes(w))?.length >= 3) {
        break;
      }

      closestParentElement = closestParentElement?.parentElement as HTMLElement;

      if (!closestParentElement) {
        return [];
      }
    }

    const lunchMenuDiv = lunchNode?.parentNode?.parentNode as HTMLDivElement;
    const raw = lunchMenuDiv?.innerText?.split('\n')?.filter((a) => a.trim() && a !== '—');
    const todayIndex = raw?.findIndex((a) => a.toLowerCase().includes(todaySwedishFormat));

    return [
      {
        type: 'meat' as const,
        title: raw[todayIndex + 1],
      },
      {
        type: 'veg' as const,
        title: raw[todayIndex + 2],
      },
    ];
  });
