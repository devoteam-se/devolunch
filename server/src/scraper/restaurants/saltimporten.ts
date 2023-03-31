import { Page } from "puppeteer";

export const meta = {
  title: "Saltimporten",
  url: "https://www.saltimporten.com/",
  imgUrl: "https://www.saltimporten.com/media/IMG_6253-512x512.jpg",
  latitude: 55.61640186079315,
  longitude: 12.997284077792935,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString("sv-SE", {
        weekday: "long",
      })
      .toLowerCase();

    const todayNode = [...document.querySelectorAll('div[class="elementor-widget-container"] div p')].find((e) =>
      (e as HTMLElement).innerText.toLowerCase().includes(todaySwedishFormat)
    );

    const regex = new RegExp(todaySwedishFormat, "i");
    const meat = todayNode?.textContent?.split(regex)[1].trim();

    const veg = [...document.querySelectorAll('div[class="elementor-widget-container"] div p')]
      .find((e) => (e as HTMLElement).innerText.toLowerCase().includes("veckans vegetariska"))
      ?.textContent?.split("veckans vegetariska".toUpperCase())[1]
      .trim();

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
