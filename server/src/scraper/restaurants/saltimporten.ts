import { Page } from "puppeteer";

export const meta = {
  title: "Saltimporten",
  url: "https://www.saltimporten.com/",
  imgUrl: "https://www.saltimporten.com/media/IMG_6253-512x512.jpg",
  googleMapsUrl: "https://goo.gl/maps/9rn3svDPeGUDaeXUA",
  latitude: 55.61608870967554,
  longitude: 12.99710506088239,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const todaySwedishFormat = new Date()
      .toLocaleString("sv-SE", {
        weekday: "long",
      })
      .toLowerCase();
    const regex = new RegExp(todaySwedishFormat.normalize("NFC"), "i");

    const todayNode = [...document.querySelectorAll("div.elementor-widget-container div p")].find((e) => {
      const text = e?.textContent?.toLocaleLowerCase("sv-SE").normalize("NFC");
      const includes = text?.includes(todaySwedishFormat.normalize("NFC"));
      return includes;
    });

    const meat = todayNode?.textContent?.normalize("NFC")?.split(regex)[1].trim();

    const veg = [...document.querySelectorAll("div.elementor-widget-container div p")]
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
