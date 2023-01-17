import { Page } from "puppeteer";

export const meta = {
  title: "Spill",
  url: "https://restaurangspill.se/",
  imgUrl: "https://restaurangspill.se/static/0de07c5b4f98bc003befad5e872686b4/9bbaf/SPILL_09.jpg",
  latitude: 55.612746399457436,
  longitude: 12.988458042546734,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const dishesNodes =
      document.querySelectorAll("#dagens")[0]?.childNodes[0]?.childNodes[0]?.childNodes[1]?.childNodes[0]?.childNodes[1]
        ?.childNodes[1].textContent;
    const a = dishesNodes?.split(/Vegetariskt?:/gm);
    const meat = a?.[0]?.replace(/(\r\n|\n|\r)/gm, " ").trim();
    const veg = a?.[1]?.replace(/(\r\n|\n|\r)/gm, " ").trim();

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
