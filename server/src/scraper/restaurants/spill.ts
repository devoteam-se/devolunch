import { Page } from "puppeteer";

export const meta = {
  title: "Spill",
  url: "https://restaurangspill.se/",
  imgUrl:
    "https://restaurangspill.se/static/0de07c5b4f98bc003befad5e872686b4/9bbaf/SPILL_09.jpg",
  latitude: 12.988458042546734,
  longitude: 55.612746399457436,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const dishesNodes =
      document.querySelectorAll("#dagens")[0].childNodes[0].childNodes[0]
        .childNodes[1].childNodes[1].childNodes[1].childNodes;
    const meat = dishesNodes[0].textContent?.replace(/(\r\n|\n|\r)/gm, " ");
    const veg = dishesNodes[1].textContent?.replace(/(\r\n|\n|\r)/gm, " ");

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
