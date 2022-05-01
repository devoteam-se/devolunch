declare namespace App {
  enum DishType {
    MEAT = "meat",
    VEG = "veg",
    FISH = "fish",
  }
  type Dish = {
    description: string;
    price?: number;
    type: DishType;
  };
  interface DishCollection {
    language: string;
    dishes: Dish[];
  }
  interface Scrape {
    defaultLanguage: string;
    date: Date;
    restaurants: Restaurant[];
  }
  interface Restaurant {
    title: string;
    description: string;
    url: string;
    imgUrl: string;
    dishCollection: DishCollection[];
    distance?: string;
  }
}
