import puppeteer = require("puppeteer")

const getSlagtHuset = async (page: puppeteer.Page) => {
  await page.goto('https://www.slagthuset.se/restaurang/');
  return page.evaluate(() => {
    const raw = [
      ...document?.querySelectorAll('h2')
    ] // @ts-ignore 
    ?.find(e => e.innerText === 'Lunch')?.parentNode?.parentNode?.nextElementSibling?.innerText
    .split('\n')
    
    const rawMenu = raw.slice(raw.findIndex((a: string) => a.includes('Meny vecka')))
    
    const dishes = []
    
    for (let i = 0; i < rawMenu.length; i++) {
      if (rawMenu[i].toLowerCase() === new Date().toLocaleString('sv-SE', { weekday: 'long' }) ||
      rawMenu[i].includes('fisk') ||
      rawMenu[i].includes('vegetarisk')
      ) {
        const type = rawMenu[i].toLowerCase() === new Date().toLocaleString('sv-SE', { weekday: 'long' }) 
          ? 'meat' : rawMenu[i].toLowerCase().includes('fisk') ? 'fish' : 'veg'
        const description = rawMenu[i + 1]
        dishes.push({
          description,
          type
        })
      }
    }
    
    let elements = {
      name: 'Slagthuset',
      description: 'Three courses to choose from, soup, newly baked bread and a salad buffet',
      imageUrl: 'https://www.slagthuset.se/wp-content/uploads/2022/03/Hemsidan_restaurang_overlay.jpg',
      dishes
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


const getSaltimporten = async (page: puppeteer.Page) => {
  await page.goto("https://www.saltimporten.com/");
  return page.evaluate(() => {
    const meat = document.querySelector('li.current')?.querySelector('div.meal')?.textContent;
    const veg = document.querySelector('div.veg')?.nextSibling?.textContent;

    return {
      title: "Saltimporten",
      description: "Idk idk idk?",
      imgUrl: "https://www.saltimporten.com/media/IMG_6253-512x512.jpg",
      dishes: [{
        "type": "meat",
        "description": meat,
      },{
        "type": "veg",
        "description": veg 
      },
    ]
    }
  })
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
    
  const slagthuset = await getSlagtHuset(page)
  console.log(slagthuset);

  const miamarias = await getMiaMarias(page)
  console.log(miamarias);

  const saltimporten = await getSaltimporten(page)
  console.log(saltimporten);

  await browser.close();
})();