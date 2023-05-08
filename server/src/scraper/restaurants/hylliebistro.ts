import { Page } from 'puppeteer';

export const meta = {
  title: 'Hyllie Bistro',
  url: 'https://www.hylliebryggeri.se/menu',
  imgUrl:
    'https://static.wixstatic.com/media/97d700_51961be0108c43cdb423ec5947b3096b~mv2.jpg/v1/crop/x_0,y_0,w_7165,h_4912/fill/w_882,h_604,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Bistro.jpg',
  googleMapsUrl: 'https://goo.gl/maps/dFEmStJASNgim5er5',
  latitude: 55.61231765164153,
  longitude: 12.999087156055637,
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

    const lunchNode = [...document.querySelectorAll('span')].find((a) => a.innerText?.toLowerCase().includes('lunch'));

    const lunchMenuDiv = lunchNode?.parentNode?.parentNode as HTMLDivElement;
    const raw = lunchMenuDiv.innerText.split('\n').filter((a) => a.trim());
    const todayIndex = raw.findIndex(
      (a) => a.toLowerCase().includes(todaySwedishFormat) || a.toLowerCase().includes(todayEnglishFormat),
    );

    return [
      {
        type: 'meat' as const,
        description: raw[todayIndex + 1],
      },
      {
        type: 'veg' as const,
        description: raw[todayIndex + 2],
      },
    ];
  });
