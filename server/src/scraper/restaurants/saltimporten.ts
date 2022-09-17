import { Page } from "puppeteer";

export const meta = {
  title: "Saltimporten",
  url: "https://www.saltimporten.com/",
  imgUrl: "https://www.saltimporten.com/media/IMG_6253-512x512.jpg",
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const meat = document
      .querySelector("li.current")
      ?.querySelector("div.meal")?.textContent;
    const veg =
      document.querySelector("div.veg")?.nextSibling?.textContent || undefined;

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
