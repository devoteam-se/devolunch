import { Page } from 'puppeteer';
import { DishProps, RestaurantProps } from '@devolunch/shared';

export const meta: RestaurantProps = {
  title: 'Hyllie Bistro',
  url: 'https://www.hylliebryggeri.se/menu',
  imgUrl:
    'https://static.wixstatic.com/media/97d700_51961be0108c43cdb423ec5947b3096b~mv2.jpg/v1/crop/x_0,y_0,w_7165,h_4912/fill/w_882,h_604,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Bistro.jpg',
  googleMapsUrl: 'https://goo.gl/maps/dFEmStJASNgim5er5',
  coordinate: {
    lat: 55.61231765164153,
    lon: 12.999087156055637,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString('sv-SE', {
        weekday: 'long',
      })
      .toLowerCase();
    const todayEnglishFormat = new Date()
      .toLocaleString('en-GB', {
        weekday: 'long',
      })
      .toLowerCase();

    const lunchNode = [...document.querySelectorAll("div[data-testid='richTextElement']")].find((a) => {
      const t = (a as HTMLElement)?.innerText?.toLocaleLowerCase('sv-SE').normalize('NFC');
      return t.includes(todaySwedishFormat) || t.includes(todayEnglishFormat);
    });

    const raw = (lunchNode as HTMLElement)?.innerText.split('\n').filter((a) => a.trim());
    const todayIndex = raw?.findIndex((a) => {
      const t = a.toLocaleLowerCase('sv-SE').normalize('NFC');
      return t.includes(todaySwedishFormat) || t.includes(todayEnglishFormat);
    });

    const dishes: DishProps[] = [];

    if (!raw) {
      return dishes;
    }

    if (raw[todayIndex + 2].length > 25) {
      dishes.push({
        type: 'veg' as const,
        title: raw[todayIndex + 2],
      });
    }
    dishes.push({
      type: dishes.length ? ('meat' as const) : ('veg' as const),
      title: raw[todayIndex + 1],
    });

    return dishes;
  });
