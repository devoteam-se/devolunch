import { Page } from 'puppeteer';

export const meta = {
  title: 'Namu',
  url: 'https://namu.nu/',
  imgUrl:
    'https://scontent-arn2-1.cdninstagram.com/v/t51.2885-15/342310447_1320499988499343_7872255442147218804_n.jpg?stp=dst-jpg_e35_p1080x1080&_nc_ht=scontent-arn2-1.cdninstagram.com&_nc_cat=107&_nc_ohc=4Pkb4EZZOcQAX-itCO7&edm=AP_V10EBAAAA&ccb=7-5&oh=00_AfA4keYO3xtfCl0Qj7g2Y05rAzC_0J_PfETviYL5mAvfDQ&oe=64A29FEB&_nc_sid=2999b8',
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
              return b.replace(/\s|\r\n|\n|\r|\t/gm, '');
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
