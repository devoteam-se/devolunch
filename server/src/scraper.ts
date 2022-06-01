import puppeteer = require("puppeteer");
import { isFish, fetchFishes } from "./is-fish";
import logger from "./logger";
import { uploadScrape } from "./storage";
import { translateRestaurants } from "./translator";

export interface Scrape {
  date: Date;
  restaurants: Restaurant[];
}

export interface Restaurant {
  title: string;
  description: string;
  url: string;
  imgUrl: string;
  dishCollection: DishCollection[];
}

export interface DishCollection {
  language: string;
  dishes: Dish[];
}

export interface Dish {
  type: DishType;
  description: string | null | undefined;
}

type DishType = "meat" | "fish" | "veg" | "misc";

const TIMEOUT = 120000;

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

        const weekShort = ["sön", "mån", "tis", "ons", "tor", "fre", "lör"];
        // Translate short weekdays to long weekdays
        if (first.length < 5) {
          first = week[weekShort.indexOf(first)];
        }
        if (last.length < 5) {
          last = week[weekShort.indexOf(last)];
        }

        const firstIndex = week.indexOf(first); // Find first day
        week = week.concat(week.splice(0, firstIndex)); // Shift array so that first day is index 0
        const lastIndex = week.indexOf(last); // Find last day
        return week.slice(0, lastIndex + 1); // Cut from first day to last day
      };

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
          const daysRaw = rawMenu[i].split(" ")[2];
          const [startDayRaw, endDayRaw] = daysRaw.split("-");
          const days = daysBetween(startDayRaw, endDayRaw).map((a) =>
            a.toLowerCase()
          );

          if (
            days.indexOf(todaySwedishFormat) > -1 ||
            days.indexOf(todaySwedishFormat) > -1
          ) {
            dishes.push({
              description,
              type: "fish" as const,
            });
          }
        }
        if (
          rawMenu[i].toLowerCase().includes("veckans vegetariska") ||
          rawMenu[i].toLowerCase().includes("vegetariskt")
        ) {
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
    url: "https://www.slagthuset.se/restaurang/",
    imgUrl:
      "https://www.slagthuset.se/wp-content/uploads/2022/03/Hemsidan_restaurang_overlay.jpg",
    dishCollection: [
      {
        language: "sv",
        dishes: dishes,
      },
    ],
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
    url: "http://www.miamarias.nu/",
    imgUrl:
      "https://i0.wp.com/www.takemetosweden.be/wp-content/uploads/2019/07/MiaMarias-Malm%C3%B6-1.png?w=500&ssl=1",
    dishCollection: [
      {
        language: "sv",
        dishes: dishes,
      },
    ],
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
    url: "http://www.saltimporten.com/",
    imgUrl: "https://www.saltimporten.com/media/IMG_6253-512x512.jpg",
    dishCollection: [
      {
        language: "sv",
        dishes: dishes,
      },
    ],
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
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title: "Spill",
    description: "",
    url: "https://restaurangspill.se/",
    imgUrl:
      "https://restaurangspill.se/static/0de07c5b4f98bc003befad5e872686b4/9bbaf/SPILL_09.jpg",
    dishCollection: [
      {
        language: "sv",
        dishes: dishes,
      },
    ],
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
      const allP = [...document.querySelectorAll("p")];
      const todayIndex = allP.findIndex((p: HTMLParagraphElement) =>
        p.textContent
          ?.toLowerCase()
          ?.includes(new Date()?.toLocaleString("sv-SE", { weekday: "long" }))
      );
      const todayMenu = allP[todayIndex + 1];

      const meat = todayMenu?.textContent;
      const veg =
        todayMenu?.nextElementSibling?.nextElementSibling?.textContent;

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
    url: "https://valfarden.nu/dagens-lunch/",
    imgUrl: "https://valfarden.nu/wp-content/uploads/2015/01/hylla.jpg",
    dishCollection: [
      {
        language: "sv",
        dishes: dishes,
      },
    ],
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
    url: "https://storavarvsgatan6.se/meny.html",
    imgUrl:
      "https://storavarvsgatan6.se/____impro/1/onewebmedia/foodiesfeed.com_close-up-on-healthy-green-broccoli%20%28kopia%29.jpg?etag=%226548df-5f256567%22&sourceContentType=image%2Fjpeg&ignoreAspectRatio&resize=1900%2B1267&extract=81%2B0%2B939%2B1190&quality=85",
    dishCollection: [
      {
        language: "sv",
        dishes: dishes,
      },
    ],
  };
};

const getBistroRoyal = async (page: puppeteer.Page): Promise<Restaurant> => {
  const title = "Bistro Royal";
  let dishes: Dish[] = [];
  try {
    await page.goto("https://bistroroyal.se/dagens-ratt/", {
      waitUntil: "load",
      timeout: TIMEOUT,
    });

    dishes = await page.evaluate(() => {
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

      const typeArray = [
        "meat" as const,
        "meat" as const,
        "fish" as const,
        "veg" as const,
      ];

      return raw.map((e, i) => ({
        type: typeArray[i],
        description: e,
      }));
    });
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title,
    description: "",
    url: "https://bistroroyal.se/dagens-ratt/",
    imgUrl:
      "https://cdn42.gastrogate.com/files/29072/bistroroyal-bistro-1-1.jpg",
    dishCollection: [
      {
        language: "sv",
        dishes: dishes,
      },
    ],
  };
};

const getRestaurangKP = async (page: puppeteer.Page): Promise<Restaurant> => {
  const title = "Restaurang KP";
  let dishes: Dish[] = [];
  try {
    await page.goto("https://restaurangkp.se/lunchbuffe/", {
      waitUntil: "load",
      timeout: TIMEOUT,
    });

    dishes = await page.evaluate(() => {
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
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title,
    description: "",
    url: "https://restaurangkp.se/lunchbuffe/",
    imgUrl: "https://gastrogate.com/thumbs/1494/files/28932/kpstart2019.jpg",
    dishCollection: [
      {
        language: "sv",
        dishes: dishes,
      },
    ],
  };
};

const getNiagara = async (page: puppeteer.Page): Promise<Restaurant> => {
  const title = "Niagara";
  let dishes: Dish[] = [];
  try {
    await page.goto("https://restaurangniagara.se/lunch/", {
      waitUntil: "load",
      timeout: TIMEOUT,
    });

    dishes = await page.evaluate(() => {
      const todaySwedishFormat = new Date()
        .toLocaleString("sv-SE", {
          weekday: "long",
        })
        .toLowerCase();

      const lunchNode = [...document.querySelectorAll("div.lunch h3")].find(
        (a) => a.textContent?.toLowerCase() === todaySwedishFormat
      )?.nextElementSibling;

      if (lunchNode) {
        const foods = [...lunchNode.querySelectorAll("tr")].map((a) => ({
          type: "misc" as const,
          description: `${a.querySelector("td:nth-child(1)")?.textContent} - ${
            a.querySelector("td:nth-child(2)")?.textContent?.split("\n")[0]
          }`,
          price: a.querySelector("td:nth-child(3)")?.textContent,
        }));

        return foods;
      }
      return [];
    });
  } catch (err: unknown) {
    logger.error(err, `Error parsing ${title}`);
  }

  return {
    title,
    description: "",
    url: "https://restaurangniagara.se/lunch/",
    imgUrl:
      "https://restaurangniagara.se/wp-content/uploads/sites/4/2015/08/Lunch-meny-Niagara1.jpg",
    dishCollection: [
      {
        language: "sv",
        dishes: dishes,
      },
    ],
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
    const bistroroyal = await getBistroRoyal(page);
    const restaurangkp = await getRestaurangKP(page);
    const niagara = await getNiagara(page);

    const compare = (a: Dish, b: Dish) => {
      const order = { veg: 1, fish: 2, meat: 3, misc: 4 };
      return order[a.type] - order[b.type];
    };

    const restaurants = [
      slagthuset,
      miamarias,
      saltimporten,
      valfarden,
      storavarvsgatan6,
      spill,
      bistroroyal,
      restaurangkp,
      niagara,
    ].map((restaurant) => ({
      ...restaurant,
      dishCollection: restaurant.dishCollection.map((dishCollection) => ({
        ...dishCollection,
        dishes: dishCollection.dishes.sort(compare).map((dish) => ({
          ...dish,
          type: isFish(dish.description, fishes) ? "fish" : dish.type,
        })),
      })),
    }));

    const scrape = {
      date: new Date(),
      restaurants: await translateRestaurants(restaurants),
    };

    await browser.close();

    await uploadScrape(scrape);
  } catch (err: unknown) {
    logger.error(err, "Scrape failed");
    throw err;
  }
  logger.info("Scrape successful");
};

export default scrape;
