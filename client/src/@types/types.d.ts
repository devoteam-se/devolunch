declare namespace App {
  enum DishType {
    MEAT = "meat",
    VEG = "veg",
    FISH = "fish",
    MISC = "misc",
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
    date: Date;
    restaurants: Restaurant[];
  }
  interface Restaurant {
    title: string;
    url: string;
    imgUrl: string;
    dishCollection: DishCollection[];
    distance?: number;
  }
}
