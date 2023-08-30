import { RestaurantMetaProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantMetaProps = {
  title: 'Slagthuset',
  url: 'https://slagthuset.se/restaurangen/',
  imageUrl: 'https://slagthuset.se/static/d18f8e233d657ea77a2e7aeb3aa65eec/cc3b1/Sodra-Hallen01-1.jpg',
  googleMapsUrl: 'https://goo.gl/maps/ZMLMAHi8XhVss2At5',
  coordinate: {
    lat: 55.61134419989048,
    lon: 13.002761498368026,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date().toLocaleString('sv-SE', { weekday: 'long' }).toLowerCase();
    const weekdays = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
    const weekdayShortNames = [/sön/i, /mån/i, /tis/i, /ons/i, /tor(s)?/i, /fre/i, /lör/i];

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
      const daysMatch = row.match(/([MmTtOoFfSsLl]\w+dag?)-([MmTtOoFfSsLl]\w+dag?)/);
      if (!daysMatch) return [];
      const [_, startDayRaw, endDayRaw] = daysMatch;
      const startDay = getFullWeekdayName(startDayRaw.toLowerCase());
      const endDay = getFullWeekdayName(endDayRaw.toLowerCase());
      return daysBetween(startDay, endDay);
    };

    const getDishType = (row: string, today: string, section: string | null): string | null => {
      const days = getDaysRangeFromMenuString(row);
      const isTodayWithinRange = days.includes(today);

      if (isTodayWithinRange) {
        if (section === 'Fisk') return 'fish';
        if (section === 'Vegetariskt') return 'veg';
      }

      if (row === today) {
        return 'meat';
      }
      return null;
    };

    const dishes = [];
    let section: string | null = null;

    const lunchNode = [...document.querySelectorAll('h3')].find((e) => e.innerText.toLowerCase().match(/v (\d{1,2})/));
    const lunchMenuDiv = lunchNode?.parentNode?.parentNode as HTMLDivElement;
    const raw = lunchMenuDiv?.innerText.split('\n').filter((a) => a.trim());

    for (let i = 0; i < raw?.length; i++) {
      const row = raw[i].toLowerCase();
      const description = raw[i + 1];

      if (row.includes('fisk')) {
        section = 'Fisk';
        continue;
      }
      if (row.includes('vegetariskt')) {
        section = 'Vegetariskt';
        continue;
      }

      const dishType = getDishType(row, todaySwedishFormat, section);

      if (dishType) {
        const dish = {
          title: description,
          type: dishType,
        };
        dishes.push(dish);
      }
    }

    return dishes;
  });
