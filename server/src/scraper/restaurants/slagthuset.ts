import { Page } from "puppeteer";

export const meta = {
  title: "Slagthuset",
  url: "https://slagthuset.se/restaurangen/",
  imgUrl: "https://slagthuset.se/static/d18f8e233d657ea77a2e7aeb3aa65eec/cc3b1/Sodra-Hallen01-1.jpg",
  latitude: 13.002761498368026,
  longitude: 55.61134419989048,
};

export const browserScrapeFunction = (page: Page) =>
  page.evaluate(() => {
    const daysBetween = (first: string, last: string) => {
      let week = ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"];

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

    const lunchNode = [...document.querySelectorAll("h3")].find((e) =>
      e.innerText.toLowerCase().includes("meny vecka")
    );

    const lunchMenuDiv = lunchNode?.parentNode?.parentNode as HTMLDivElement;

    const raw = lunchMenuDiv.innerText.split("\n");

    const dishes = [];
    const todaySwedishFormat = new Date()
      .toLocaleString("sv-SE", {
        weekday: "long",
      })
      .toLowerCase();

    for (let i = 0; i < raw.length; i++) {
      const description = raw[i + 1];
      if (raw[i].toLowerCase() === todaySwedishFormat) {
        dishes.push({
          description,
          type: "meat" as const,
        });
      }

      if (
        raw[i].toLowerCase().includes("fisk") ||
        raw[i].toLowerCase().includes("dagens fisk") ||
        raw[i].toLowerCase().includes("veckans fisk")
      ) {
        const numWords = raw[i].split(" ").length;
        if (numWords > 2) {
          continue;
        }
        const daysRaw = raw[i].split(" ")[numWords - 1];
        const [startDayRaw, endDayRaw] = daysRaw.split("-");
        const days = daysBetween(startDayRaw, endDayRaw).map((a) => a.toLowerCase());

        if (days.indexOf(todaySwedishFormat) > -1 || days.indexOf(todaySwedishFormat) > -1) {
          dishes.push({
            description,
            type: "fish" as const,
          });
        }
      }

      if (
        raw[i].toLowerCase().includes("dagens vegetariska") ||
        raw[i].toLowerCase().includes("veckans vegetariska") ||
        raw[i].toLowerCase().includes("vegetariskt")
      ) {
        const numWords = raw[i].split(" ").length;
        if (numWords > 2) {
          continue;
        }
        const daysRaw = raw[i].split(" ")[numWords - 1];
        const [startDayRaw, endDayRaw] = daysRaw.split("-");
        const days = daysBetween(startDayRaw, endDayRaw).map((a) => a.toLowerCase());

        if (days.indexOf(todaySwedishFormat) > -1 || days.indexOf(todaySwedishFormat) > -1) {
          dishes.push({
            description,
            type: "veg" as const,
          });
        }
      }
    }
    return dishes;
  });
