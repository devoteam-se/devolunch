import { Page } from "puppeteer";

export const meta = {
  title: "Restaurang KP",
  url: "https://restaurangkp.se/lunchbuffe/",
  imgUrl: "https://gastrogate.com/thumbs/1494/files/28932/kpstart2019.jpg",
  latitude: 12.99867277475147,
  longitude: 55.609991683996796,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString("sv-SE", {
        weekday: "long",
      })
      .toLowerCase();

    const lunchNode = [...document.querySelectorAll(".menu_header")]?.find(
      (e) => e.textContent?.toLowerCase()?.includes(todaySwedishFormat)
    );
    const lunchMenuDiv = lunchNode?.parentNode?.parentNode as HTMLElement;
    const htmlElement = lunchMenuDiv?.nextElementSibling as HTMLElement;
    const raw = htmlElement
      ? [...htmlElement.querySelectorAll(".td_title")]?.map((e) =>
          e.textContent?.trim()
        )
      : [];

    const typeArray = ["meat" as const, "fish" as const, "veg" as const];

    return raw.map((e, i) => ({
      type: typeArray[i],
      description: e,
    }));
  });
