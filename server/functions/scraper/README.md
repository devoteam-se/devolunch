# Scraper

The scraper picks up all restaurants that are located in `/src/restaurants`.

You can decide either to scrape a website or a PDF on a website. In the case of a PDF, the scraper expects the return of `browserScrapeFunction` to be a URL.

If you want to scrape a PDF make sure to add the `pdf: true` to the meta-data variable and an exported function called `pdfScrapeFunction`.

Here are two different examples on how to parse the DOM of the website, to either extract an array of dishes or extract the link to the PDF:

### Get array of dishes from DOM:

```js
import { Page } from "puppeteer";

export const meta = {
  title: "Stora Varvsgatan",
  url: "https://storavarvsgatan6.se/meny.html",
  imgUrl:
    "https://storavarvsgatan6.se/____impro/1/onewebmedia/foodiesfeed.com_close-up-on-healthy-green-broccoli%20%28kopia%29.jpg?etag=%226548df-5f256567%22&sourceContentType=image%2Fjpeg&ignoreAspectRatio&resize=1900%2B1267&extract=81%2B0%2B939%2B1190&quality=85",
  googleMapsUrl: "https://goo.gl/maps/5YUuxPzsMSg5kmK98",
  latitude: 55.612390477729015,
  longitude: 12.991505487495564,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const today = [...document.querySelectorAll("p")]?.find((e) =>
      e?.textContent?.toLowerCase()?.includes(new Date()?.toLocaleString("sv-SE", { weekday: "long" }))
    );
    const meat = today?.nextElementSibling?.textContent;
    const veg = today?.nextElementSibling?.nextElementSibling?.textContent;

    return [
      {
        type: "meat" as const,
        description: meat,
      },
      {
        type: "veg" as const,
        description: veg,
      },
    ];
  });
```

### Get URL to PDF from DOM and parse array of dishes from PDF:

```js
import { Page } from 'puppeteer';
import pdf from 'pdf-parse';

export const meta = {
  title: 'BISe',
  url: 'https://bise.se/lunch',
  imgUrl:
    'https://bise.se/_next/image?url=https%3A%2F%2Fcms.bise.se%2Fwp-content%2Fuploads%2F2022%2F10%2FLunch_Bise.jpeg&w=1080&q=75',
  googleMapsUrl: 'https://goo.gl/maps/9hmQUctdgeNvVSuF8',
  latitude: 55.60675917303053,
  longitude: 12.996173056055413,
  pdf: true,
};

export const browserScrapeFunction = async (page: Page) =>
  page.evaluate(async () => {
    const lunchNode = [...document.querySelectorAll('a')].find((a) =>
      a?.innerText?.toLowerCase()?.includes('veckans lunchmeny'),
    );
    const url = lunchNode?.getAttribute('href');

    if (!url) {
      return [];
    }

    return url;
  });

export const pdfScrapeFunction = async (url: string) => {
  const todaySwedishFormat = new Date()
    .toLocaleString('sv-SE', {
      weekday: 'long',
    })
    .toLowerCase();

  const f = await fetch(url);
  const buffer = await f.arrayBuffer();
  const pdfData = await pdf(Buffer.from(buffer));

  const raw = pdfData.text
    .split('\n')
    .map((a: string) =>
      a
        .replace(/ {2}|\r\n|\n|\r/gm, '')
        .replace('’', '')
        .trim(),
    )
    .filter((a: string) => a && !a.startsWith('Warning'));

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const todayMeatIndex = raw.findIndex((a: string) => a.toLowerCase().includes(todaySwedishFormat));
  const vegIndex = raw.findIndex((a: string) => a.toLowerCase().includes('veckans vegetariska'));

  const todayMeat = {
    type: 'meat' as const,
    description: capitalizeFirstLetter(raw[todayMeatIndex + 1]),
  };

  const veg = {
    type: 'veg' as const,
    description: capitalizeFirstLetter(raw[vegIndex + 1]),
  };

  return [todayMeat, veg];
};
```

### Debug

If you want to debug your specific scraper you can uncomment the `filesOverride` variable in [src/index.ts](src/index.ts)
