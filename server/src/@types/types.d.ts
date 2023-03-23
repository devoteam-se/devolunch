declare interface Scrape {
  date: Date;
  restaurants: Restaurant[];
}

declare interface Restaurant {
  title: string;
  description: string;
  url: string;
  imgUrl: string;
  dishCollection: DishCollection[];
  longitude: number;
  latitude: number;
  distance: number;
}

declare interface DishCollection {
  language: string;
  dishes: Dish[];
}

declare interface Dish {
  type: DishType;
  description: string | null | undefined;
}

declare type DishType = "meat" | "fish" | "veg" | "misc";
