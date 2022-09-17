import { Page } from "puppeteer";

export const meta = {
  title: "Välfärden",
  url: "https://valfarden.nu/dagens-lunch/",
  imgUrl: "https://valfarden.nu/wp-content/uploads/2015/01/hylla.jpg",
  latitude: 12.994400413711007,
  longitude: 55.61123819992324,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const allP = [...document.querySelectorAll("p")];
    const todayIndex = allP.findIndex((p: HTMLParagraphElement) =>
      p.textContent
        ?.toLowerCase()
        ?.includes(new Date()?.toLocaleString("sv-SE", { weekday: "long" }))
    );
    const todayMenu = allP[todayIndex + 1];

    const meat = todayMenu?.textContent;
    const veg = todayMenu?.nextElementSibling?.nextElementSibling?.textContent;

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
