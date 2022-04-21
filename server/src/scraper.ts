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

const getMiaMarias = async (page: puppeteer.Page) => {
  await page.goto("http://www.miamarias.nu/");
  return page.evaluate(() => {
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
      const type = raw[i]
        .match(/^[^0-9]+/)
        ?.shift()
        ?.trim();
      const price = Number(raw[i].match(/([0-9]+)\s?kr/)?.slice(1, 2));
      const description = raw[i + 1];
      dishes.push({ type, price, description });
    }

    return {
      title: "MiaMarias",
      description: "Idk?",
      imgUrl: "http://www.miamarias.nu/wp-content/uploads/2018/07/logo_new.png",
      dishes,
    };
  });
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
    
  const slagthuset = await getSlagtHuset(page)
  console.log(slagthuset);

  const miamarias = await getMiaMarias(page)
  console.log(miamarias);

  await browser.close();
})();