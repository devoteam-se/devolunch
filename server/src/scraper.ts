import puppeteer = require("puppeteer");
import { Storage } from "@google-cloud/storage";
import { isFish, fetchFishes } from "./is-fish";
import logger from "./logger";

export interface Restaurant {
  title: string;
  description: string;
  imgUrl: string;
  dishes: Dish[];
}

export interface Dish {
  type: DishType;
  description: string | null | undefined;
}

type DishType = "meat" | "fish" | "veg";

const BUCKET_NAME = "devolunch";
const TIMEOUT = 120000;

const storage = new Storage({
  projectId: "devolunch",
});

const getSlagtHuset = async (page: puppeteer.Page): Promise<Restaurant> => {
  const title = "Slagthuset";
  let dishes: Dish[] = [];
  try {
    await page.goto("https://www.slagthuset.se/restaurang/", {
      waitUntil: "load",
      timeout: TIMEOUT,
    });
    dishes = await page.evaluate(() => {
      const lunchNode = [...document.querySelectorAll("h2")].find(
        (e) => e.innerText === "Lunch"
      );
      const lunchMenuDiv = lunchNode?.parentNode?.parentNode as HTMLDivElement;
      const htmlElement = lunchMenuDiv.nextElementSibling as HTMLElement;
      const raw = htmlElement.innerText.split("\n");

      const rawMenu = raw.slice(
        raw.findIndex((a: string) => a.includes("Meny vecka"))
      );

      const dishes = [];
      const todaySwedishFormat = new Date()
        .toLocaleString("sv-SE", {
          weekday: "long",
        })
        .toLowerCase();

      for (let i = 0; i < rawMenu.length; i++) {
        const description = rawMenu[i + 1];
        if (rawMenu[i].toLowerCase() === todaySwedishFormat) {
          dishes.push({
            description,
            type: "meat" as const,
          });
        }
        if (rawMenu[i].toLowerCase().includes("veckans fisk")) {
          const daysBetween = (first: string, last: string) => {
            let week = [
              "söndag",
              "måndag",
              "tisdag",
              "onsdag",
              "torsdag",
              "fredag",
              "lördag",
            ];

            const firstIndex = week.indexOf(first); // Find first day
            week = week.concat(week.splice(0, firstIndex)); // Shift array so that first day is index 0
            const lastIndex = week.indexOf(last); // Find last day
            return week.slice(0, lastIndex + 1); // Cut from first day to last day
          };

          const daysRaw = rawMenu[i].split(" ")[2];
          const [startDayRaw, endDayRaw] = daysRaw.split("-");
          const days = daysBetween(startDayRaw, endDayRaw);

          if (
            days.map((a) => a.toLowerCase()).indexOf(todaySwedishFormat) > -1
          ) {
            dishes.push({
              description,
              type: "fish" as const,
            });
          }
        }
        if (rawMenu[i].toLowerCase().includes("veckans vegetariska")) {
          dishes.push({
            description,
            type: "veg" as const,
          });
        }
      }
      return dishes;
    });
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title,
    description: "",
    imgUrl:
      "https://www.slagthuset.se/wp-content/uploads/2022/03/Hemsidan_restaurang_overlay.jpg",
    dishes,
  };
};

const getMiaMarias = async (page: puppeteer.Page): Promise<Restaurant> => {
  const title = "MiaMarias";
  let dishes: Dish[] = [];
  try {
    await page.goto("http://www.miamarias.nu/", {
      waitUntil: "load",
      timeout: TIMEOUT,
    });
    dishes = await page.evaluate(() => {
      const dayOfWeek = new Date().getDay();
      const tables = Array.from(document.querySelectorAll("table"));
      const raw =
        tables
          .slice(dayOfWeek - 1, dayOfWeek)
          .pop()
          ?.querySelector("tbody")
          ?.textContent?.split("\n")
          .filter((e: string) => e.trim()) || [];

      const dishes = [];

      for (let i = 0; i < raw.length; i += 2) {
        const swedishType = raw[i]
          .match(/^[^0-9]+/)
          ?.shift()
          ?.trim();
        const type: DishType =
          swedishType === "Fisk"
            ? "fish"
            : swedishType === "Kött"
            ? "meat"
            : "veg";

        const price = Number(raw[i].match(/([0-9]+)\s?kr/)?.slice(1, 2));
        const description = raw[i + 1];
        dishes.push({ type, price, description });
      }
      return dishes;
    });
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title,
    description: "",
    imgUrl:
      "https://i0.wp.com/www.takemetosweden.be/wp-content/uploads/2019/07/MiaMarias-Malm%C3%B6-1.png?w=500&ssl=1",
    dishes,
  };
};

const getSaltimporten = async (page: puppeteer.Page): Promise<Restaurant> => {
  const title = "Saltimporten";
  let dishes: Dish[] = [];
  try {
    await page.goto("https://www.saltimporten.com/", {
      waitUntil: "load",
      timeout: TIMEOUT,
    });
    dishes = await page.evaluate(() => {
      const meat = document
        .querySelector("li.current")
        ?.querySelector("div.meal")?.textContent;
      const veg =
        document.querySelector("div.veg")?.nextSibling?.textContent ||
        undefined;

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
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title,
    description: "",
    imgUrl: "https://www.saltimporten.com/media/IMG_6253-512x512.jpg",
    dishes,
  };
};

const getSpill = async (page: puppeteer.Page): Promise<Restaurant> => {
  const title = "Spill";
  let dishes: Dish[] = [];
  try {
    await page.goto("https://restaurangspill.se/", {
      waitUntil: "load",
      timeout: TIMEOUT,
    });
    dishes = await page.evaluate(() => {
      const dishesNodes =
        document.querySelectorAll("#dagens")[0].childNodes[0].childNodes[0]
          .childNodes[1].childNodes[1].childNodes[1].childNodes;
      const meat = dishesNodes[0].textContent;
      const veg = dishesNodes[1].textContent;

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
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title: "Spill",
    description: "",
    imgUrl:
      "https://restaurangspill.se/static/3b466597bfc0e9c31983055c24912a82/8d77c/278837080_565924558044044_2459276550772784820_n.webp",
    dishes,
  };
};

const getValfarden = async (page: puppeteer.Page): Promise<Restaurant> => {
  const title = "Välfärden";
  let dishes: Dish[] = [];
  try {
    await page.goto("https://valfarden.nu/dagens-lunch/", {
      waitUntil: "load",
      timeout: TIMEOUT,
    });
    dishes = await page.evaluate(() => {
      const today = [...document.querySelectorAll("p")]?.find((e) =>
        e?.textContent
          ?.toLowerCase()
          ?.includes(new Date()?.toLocaleString("sv-SE", { weekday: "long" }))
      );
      const meat = today?.nextElementSibling?.textContent;
      const veg =
        today?.nextElementSibling?.nextElementSibling?.nextElementSibling
          ?.textContent;

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
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title,
    description: "",
    imgUrl: "https://valfarden.nu/wp-content/uploads/2015/01/hylla.jpg",
    dishes,
  };
};

const getStoraVarvsgatan = async (
  page: puppeteer.Page
): Promise<Restaurant> => {
  const title = "Stora Varvsgatan 6";
  let dishes: Dish[] = [];
  try {
    await page.goto("https://storavarvsgatan6.se/meny.html", {
      waitUntil: "load",
      timeout: TIMEOUT,
    });
    dishes = await page.evaluate(() => {
      const today = [...document.querySelectorAll("p")]?.find((e) =>
        e?.textContent
          ?.toLowerCase()
          ?.includes(new Date()?.toLocaleString("sv-SE", { weekday: "long" }))
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
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title,
    description: "",
    imgUrl:
      "https://storavarvsgatan6.se/____impro/1/onewebmedia/foodiesfeed.com_close-up-on-healthy-green-broccoli%20%28kopia%29.jpg?etag=%226548df-5f256567%22&sourceContentType=image%2Fjpeg&ignoreAspectRatio&resize=1900%2B1267&extract=81%2B0%2B939%2B1190&quality=85",
    dishes,
  };
};

const scrape = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    const fishes = await fetchFishes();

    const slagthuset = await getSlagtHuset(page);
    const miamarias = await getMiaMarias(page);
    const saltimporten = await getSaltimporten(page);
    const valfarden = await getValfarden(page);
    const storavarvsgatan6 = await getStoraVarvsgatan(page);
    const spill = await getSpill(page);

    const restaurants = [
      slagthuset,
      miamarias,
      saltimporten,
      valfarden,
      storavarvsgatan6,
      spill,
    ];
    restaurants.map((restaurant) =>
      restaurant.dishes.map(
        (dish) =>
          (dish.type = isFish(dish.description, fishes) ? "fish" : dish.type)
      )
    );

    await browser.close();

    const bucket = storage.bucket(BUCKET_NAME);
    await bucket.file("restaurants.json").save(JSON.stringify(restaurants));
  } catch (err: unknown) {
    logger.error(err, "Scrape failed");
    throw err;
  }
  logger.info("Scrape successful");
};

export default scrape;
