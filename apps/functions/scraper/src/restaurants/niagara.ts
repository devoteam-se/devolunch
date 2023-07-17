import { Page } from 'puppeteer';

export const meta = {
  title: 'Niagara',
  url: 'https://restaurangniagara.se/lunch/',
  imgUrl: 'https://restaurangniagara.se/wp-content/uploads/sites/4/2015/08/Lunch-meny-Niagara1.jpg',
  googleMapsUrl: 'https://goo.gl/maps/5SAyzPUHhb2xrNXRA',
  latitude: 55.60874652087178,
  longitude: 12.994182713710865,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString('sv-SE', {
        weekday: 'long',
      })
      .toLowerCase();

    const lunchNode = [...document.querySelectorAll('div.lunch h3')].find(
      (a) => a.textContent?.toLowerCase() === todaySwedishFormat,
    )?.nextElementSibling;

    if (lunchNode) {
      const foods = [...lunchNode.querySelectorAll('tr')].map((a) => ({
        type: 'misc' as const,
        title: `${a.querySelector('td:nth-child(1)')?.textContent} - ${
          a.querySelector('td:nth-child(2)')?.textContent?.split('\n')[0]
        }`,
        price: a.querySelector('td:nth-child(3)')?.textContent,
      }));

      return foods;
    }
    return [];
  });
