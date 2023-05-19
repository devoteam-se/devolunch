export interface Scrape {
  date: Date;
  restaurants: Restaurant[];
}

export interface Restaurant {
  title: string;
  url: string;
  imgUrl: string;
  dishCollection: DishCollection[];
  longitude: number;
  latitude: number;
  distance: number;
  googleMapsUrl: string;
}

export interface DishCollection {
  language: string;
  dishes: Dish[];
}

export interface Dish {
  type: DishType;
  description: string | null | undefined;
}

export type DishType = 'meat' | 'fish' | 'veg' | 'misc';
