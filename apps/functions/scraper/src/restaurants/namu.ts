import { Page } from 'puppeteer';

export const meta = {
  title: 'Namu',
  url: 'https://namu.nu/',
  imgUrl: 'https://namu.nu/wp-content/uploads/2017/05/Namul-darker2-3k-min.jpg',
  googleMapsUrl: 'https://goo.gl/maps/XtFUKSvmDQTUpR146',
  latitude: 55.605198570165165,
  longitude: 12.997516926554482,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('ul.fdm-section-lunch-pa-namu li')]
      .map(
        (meal) =>
          (meal as HTMLElement).innerText
            .split('\n')
            .map((b) => {
              return b.replace(/\r\n|\n|\r|\t/gm, '');
            })
            .filter((b) => b.length)[0],
      )
      .slice(1)
      .map((meal) => {
        return {
          type: 'misc' as const,
          description: meal.charAt(0).toUpperCase() + meal.slice(1).toLowerCase(),
        };
      }),
  );
