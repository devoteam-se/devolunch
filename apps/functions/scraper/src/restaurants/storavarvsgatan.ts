import { Page } from 'puppeteer';

export const meta = {
  title: 'Stora Varvsgatan',
  url: 'https://storavarvsgatan6.se/meny.html',
  imgUrl:
    'https://storavarvsgatan6.se/____impro/1/onewebmedia/foodiesfeed.com_close-up-on-healthy-green-broccoli%20%28kopia%29.jpg?etag=%226548df-5f256567%22&sourceContentType=image%2Fjpeg&ignoreAspectRatio&resize=1900%2B1267&extract=81%2B0%2B939%2B1190&quality=85',
  googleMapsUrl: 'https://goo.gl/maps/5YUuxPzsMSg5kmK98',
  latitude: 55.612390477729015,
  longitude: 12.991505487495564,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const today = [...document.querySelectorAll('p')]?.find((e) =>
      e?.textContent?.toLowerCase()?.includes(new Date()?.toLocaleString('sv-SE', { weekday: 'long' })),
    );
    const meat = today?.nextElementSibling?.textContent;
    const veg = today?.nextElementSibling?.nextElementSibling?.textContent;

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
