import { RestaurantProps } from '@devolunch/shared';
import { Page } from 'puppeteer';

export const meta: RestaurantProps = {
  title: 'Restaurang KP',
  url: 'https://restaurangkp.se/lunchbuffe/',
  imgUrl: 'https://gastrogate.com/thumbs/1494/files/28932/kpstart2019.jpg',
  googleMapsUrl: 'https://goo.gl/maps/gC7veNFosQkEm6Xm8',
  coordinate: {
    lat: 55.60899502071826,
    lon: 12.9995314560394,
  },
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString('sv-SE', {
        weekday: 'long',
      })
      .toLowerCase();

    const lunchNode = [...document.querySelectorAll('.menu_header')]?.find((e) =>
      e.textContent?.toLowerCase()?.includes(todaySwedishFormat),
    );
    const lunchMenuDiv = lunchNode?.parentNode?.parentNode as HTMLElement;
    const htmlElement = lunchMenuDiv?.nextElementSibling as HTMLElement;
    const raw = htmlElement ? [...htmlElement.querySelectorAll('.td_title')]?.map((e) => e.textContent?.trim()) : [];

    const typeArray = ['meat' as const, 'fish' as const, 'veg' as const];

    return raw.map((e, i) => ({
      type: typeArray[i],
      title: e,
    }));
  });
