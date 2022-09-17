import { Page } from "puppeteer";

export const meta = {
  title: "Slagthuset",
  url: "https://www.slagthuset.se/restaurang/",
  imgUrl:
    "https://www.slagthuset.se/wp-content/uploads/2022/03/Hemsidan_restaurang_overlay.jpg",
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
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

      const weekShort = [/sön/, /mån/, /tis/, /ons/, /tors?/, /fre/, /lör/];
      // Translate short weekdays to long weekdays
      if (first?.length <= 4) {
        first = week[weekShort.findIndex((a) => a.test(first))];
      }
      if (last?.length <= 4) {
        last = week[weekShort.findIndex((a) => a.test(last))];
      }

      const firstIndex = week.indexOf(first); // Find first day
      week = week.concat(week.splice(0, firstIndex)); // Shift array so that first day is index 0
      const lastIndex = week.indexOf(last); // Find last day
      return week.slice(0, lastIndex + 1); // Cut from first day to last day
    };

    const rawMenu = raw.slice(
      raw.findIndex((a: string) => a.includes("Lunch v."))
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
            type: "veg" as const,
          });
        }
      }
    }
    return dishes;
  });
