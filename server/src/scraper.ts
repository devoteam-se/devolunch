import puppeteer = require("puppeteer");
import { Storage } from "@google-cloud/storage";

const BUCKET_NAME = "devolunch";

const storage = new Storage();

const getSlagtHuset = async (page: puppeteer.Page) => {
  await page.goto('https://www.slagthuset.se/restaurang/');
  return page.evaluate(() => {
    const raw = [
      ...document?.querySelectorAll('h2')
    ] // @ts-ignore 
    ?.find(e => e.innerText === 'Lunch')?.parentNode?.parentNode?.nextElementSibling?.innerText
    .split('\n');
    
    const rawMenu = raw.slice(raw.findIndex((a: string) => a.includes('Meny vecka')));
    
    const dishes = [];
    
    for (let i = 0; i < rawMenu.length; i++) {
      if (rawMenu[i].toLowerCase() === new Date().toLocaleString('sv-SE', { weekday: 'long' }) ||
      rawMenu[i].includes('fisk') ||
      rawMenu[i].includes('vegetarisk')
      ) {
        const type = rawMenu[i].toLowerCase() === new Date().toLocaleString('sv-SE', { weekday: 'long' }) 
          ? 'meat' : rawMenu[i].toLowerCase().includes('fisk') ? 'fish' : 'veg';
        const description = rawMenu[i + 1];
        dishes.push({
          description,
          type
        });
      }
    }
    
    const elements = {
      name: 'Slagthuset',
      description: 'Three courses to choose from, soup, newly baked bread and a salad buffet',
      imageUrl: 'https://www.slagthuset.se/wp-content/uploads/2022/03/Hemsidan_restaurang_overlay.jpg',
      dishes
    };

    return elements;
  });
};

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
    const meat = document.querySelector("li.current")?.querySelector("div.meal")?.textContent;
    const veg = document.querySelector("div.veg")?.nextSibling?.textContent;

    return {
      title: "Saltimporten",
      description: "Idk idk idk?",
      imgUrl: "https://www.saltimporten.com/media/IMG_6253-512x512.jpg",
      dishes: [
        {
          type: "meat",
          description: meat,
        },
        {
          type: "veg",
          description: veg,
        },
      ],
    };
  });
};

const getSpill = async (page: puppeteer.Page) => {
  await page.goto("https://restaurangspill.se/");
  return page.evaluate(() => {
    const container = Array.from(document.querySelectorAll(".container"));
    const paragraphs = Array.from(
      container.find((e) => e.textContent?.includes("Dagens Lunch"))?.querySelectorAll("p") || []
    );
    const dishes = paragraphs
      .slice(1, 3)
      .map((e) => e.innerText)
      .flatMap((e) => e.split("\n"))
      .filter((e) => e.trim());
    const price = Number(
      paragraphs
        .find((e) => e.textContent?.includes("kostar"))
        ?.textContent?.match(/([0-9]+)kr/)
        ?.slice(1, 2)
    );

    const meat = dishes
      .filter((dish) => !dish.toLowerCase().includes("vegetarisk"))
      .map((description) => ({ type: "meat", price, description }));
    const veg = dishes
      .filter((dish) => dish.toLowerCase().includes("vegetarisk"))
      .map((description) => ({ type: "veg", price, description }));

    return {
      title: "Spill",
      description: "Only henrik eats here?",
      imgUrl: "https://restaurangspill.se/assets/images/screenshot2-479x423.png",
      dishes: [...meat, ...veg],
    };
  });
};

const getValfarden = async (page: puppeteer.Page) => {
  await page.goto("https://valfarden.nu/dagens-lunch/");
  return page.evaluate(() => {
    const today = [
      ...document?.querySelectorAll('p')
    ]?.find((e) => e?.textContent?.toLowerCase()?.includes(new Date()?.toLocaleString('sv-SE', { weekday: 'long' })));
    const meat = today?.nextElementSibling?.textContent;
    const veg = today?.nextElementSibling?.nextElementSibling?.nextElementSibling?.textContent;

    return {
      title: "Välfärden",
      description: "Idk idk idk?",
      imgUrl: "https://valfarden.nu/wp-content/uploads/2015/01/hylla.jpg",
      dishes: [{
        "type": "meat",
        "description": meat,
      },{
        "type": "veg",
        "description": veg 
      },
    ]
    };
  });
};

const getStoraVarvsgatan = async (page: puppeteer.Page) => {
  await page.goto("https://storavarvsgatan6.se/meny.html");
  return page.evaluate(() => {
    const today = [
      ...document?.querySelectorAll('p')
    ]?.find((e) => e?.textContent?.toLowerCase()?.includes(new Date()?.toLocaleString('sv-SE', { weekday: 'long' })));
    const meat = today?.nextElementSibling?.textContent;
    const veg = today?.nextElementSibling?.nextElementSibling?.textContent;

    return {
      title: "Stora Varvsgatan 6",
      description: "Idk idk idk?",
      imgUrl: "https://storavarvsgatan6.se/____impro/1/onewebmedia/foodiesfeed.com_close-up-on-healthy-green-broccoli%20%28kopia%29.jpg?etag=%226548df-5f256567%22&sourceContentType=image%2Fjpeg&ignoreAspectRatio&resize=1900%2B1267&extract=81%2B0%2B939%2B1190&quality=85",
      dishes: [{
        "type": "meat",
        "description": meat,
      },{
        "type": "veg",
        "description": veg 
      },
    ]
    };
  });
};

const scrape = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const slagthuset = await getSlagtHuset(page);
  console.log(slagthuset);

  const miamarias = await getMiaMarias(page);
  console.log(miamarias);

  const saltimporten = await getSaltimporten(page);
  console.log(saltimporten);
  
  const valfarden = await getValfarden(page);
  console.log(valfarden);

  const storavarvsgatan6 = await getStoraVarvsgatan(page);
  console.log(storavarvsgatan6);

  const spill = await getSpill(page);
  console.log(spill);

  await browser.close();

  const bucket = storage.bucket(BUCKET_NAME);
  await bucket
    .file("restaurants.json")
    .save(JSON.stringify([slagthuset, miamarias, saltimporten, valfarden, storavarvsgatan6, spill]));
};

export default scrape;