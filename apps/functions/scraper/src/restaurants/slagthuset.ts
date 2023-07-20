import { RestaurantProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantProps = {
  title: 'Slagthuset',
  url: 'https://slagthuset.se/restaurangen/',
  imgUrl: 'https://slagthuset.se/static/d18f8e233d657ea77a2e7aeb3aa65eec/cc3b1/Sodra-Hallen01-1.jpg',
  googleMapsUrl: 'https://goo.gl/maps/ZMLMAHi8XhVss2At5',
  coordinate: {
    lat: 55.61134419989048,
    lon: 13.002761498368026,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString('sv-SE', {
        weekday: 'long',
      })
      .toLowerCase();

    const weekdays: string[] = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
    const weekdayShortNames: RegExp[] = [/sön/i, /mån/i, /tis/i, /ons/i, /tor(s)?/i, /fre/i, /lör/i];

    const getFullWeekdayName = (shortName: string): string => {
      const index = weekdayShortNames.findIndex((re) => re.test(shortName));
      return index >= 0 ? weekdays[index] : shortName;
    };

    const daysBetween = (first: string, last: string): string[] => {
      const firstIndex = weekdays.indexOf(first);
      const lastIndex = weekdays.indexOf(last);

      if (firstIndex < 0 || lastIndex < 0 || lastIndex < firstIndex) {
        throw new Error(`Invalid days range: ${first}-${last}`);
      }

      return weekdays.slice(firstIndex, lastIndex + 1);
    };

    const getDaysRangeFromMenuString = (row: string): string[] => {
      const numWords = row.split(' ')?.length;
      if (numWords !== 2) {
        return [];
      }
      const daysRaw = row.split(' ')[numWords - 1];
      const [startDayRaw, endDayRaw] = daysRaw.split('-');

      const startDay = getFullWeekdayName(startDayRaw.toLowerCase());
      const endDay = getFullWeekdayName(endDayRaw.toLowerCase());

      return daysBetween(startDay, endDay);
    };

    const getDishType = (row: string, today: string): 'meat' | 'fish' | 'veg' | 'misc' | null => {
      const days = getDaysRangeFromMenuString(row);
      const isTodayWithinRange = days.includes(today);
      const isFish = row.includes('fisk') || row.includes('dagens fisk') || row.includes('veckans fisk');
      const isVeg =
        row.includes('vegetariskt') || row.includes('dagens vegetariska') || row.includes('veckans vegetariska');

      if (isTodayWithinRange && isFish) {
        return 'fish';
      }

      if (isTodayWithinRange && isVeg) {
        return 'veg';
      }

      if (row === today) {
        return 'meat';
      }

      return null;
    };

    const dishes = [];

    const lunchNode = [...document.querySelectorAll('h3')].find((e) =>
      e.innerText.toLowerCase().includes('meny vecka'),
    );
    const lunchMenuDiv = lunchNode?.parentNode?.parentNode as HTMLDivElement;
    const raw = lunchMenuDiv?.innerText.split('\n');

    for (let i = 0; i < raw?.length; i++) {
      const row = raw[i].toLowerCase();
      const dishType = getDishType(row, todaySwedishFormat);
      const description = raw[i + 1];

      if (dishType) {
        const dish = {
          description,
          type: dishType,
        };
        dishes.push(dish);
      }
    }
    return dishes;
  });
