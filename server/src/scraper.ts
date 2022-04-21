import { DESTRUCTION } from "dns";
import puppeteer = require("puppeteer")

const getSlagtHuset = async (page: puppeteer.Page) => {
  await page.goto('https://www.slagthuset.se/restaurang/');
  return page.evaluate(() => {
    let elements = {
      name: 'Slagthuset',
      dishes: [
        ...document?.querySelectorAll('h2')
      ] // @ts-ignore 
      ?.find(e => e.innerText === 'Lunch')?.parentNode?.parentNode?.nextElementSibling?.innerText
      .split('\n')
      .filter((e: string) => e.toLowerCase().includes(new Date().toLocaleString('sv-SE', { weekday: 'long' })))
    }

    return elements;
  })
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
    
  const slagthuset = await getSlagtHuset(page)
  console.log(slagthuset);

  await browser.close();
})();