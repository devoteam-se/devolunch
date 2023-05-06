import { Page } from 'puppeteer';

export const meta = {
  title: 'Välfärden',
  url: 'https://valfarden.nu/dagens-lunch/',
  imgUrl: 'https://valfarden.nu/wp-content/uploads/2015/01/hylla.jpg',
  googleMapsUrl: 'https://goo.gl/maps/cLAKuD2B95N8bqr19',
  latitude: 55.61123819992324,
  longitude: 12.994400413711007,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const allP = [...document.querySelectorAll('p')];
    const todayIndex = allP.findIndex((p: HTMLParagraphElement) =>
      p.textContent?.toLowerCase()?.includes(new Date()?.toLocaleString('sv-SE', { weekday: 'long' })),
    );

    let meat = '';
    let veg = '';
    for (let i = todayIndex + 2; i <= allP.length; i++) {
      const textContent: string = allP[i]?.textContent || '';
      if (textContent.length > 5) {
        if (meat.length && veg.length) {
          break;
        }
        if (meat.length) {
          veg = allP[i]?.textContent || '';
          break;
        }
        meat = allP[i]?.textContent || '';
      }
    }

    return [
      {
        type: 'meat' as const,
        description: meat,
      },
      {
        type: 'veg' as const,
        description: veg,
      },
    ];
  });
