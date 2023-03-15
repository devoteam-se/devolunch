import { Page } from "puppeteer";

export const meta = {
  title: "Saltimporten",
  url: "https://www.saltimporten.com/",
  imgUrl: "https://www.saltimporten.com/media/IMG_6253-512x512.jpg",
  latitude: 12.997284077792935,
  longitude: 55.61640186079315,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString("sv-SE", {
        weekday: "long",
      })
      .toLowerCase();

    const todayNode = [...document.querySelectorAll("p")].find((e) =>
      e.innerText.toLowerCase().includes(todaySwedishFormat)
    );

    console.log(todayNode?.textContent);

    const meat = todayNode?.textContent?.split(todaySwedishFormat.toUpperCase())[1].trim();

    const veg = [...document.querySelectorAll("p")]
      .find((e) => e.innerText.toLowerCase().includes("veckans vegetariska"))
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
