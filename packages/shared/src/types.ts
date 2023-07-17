export interface Scrape {
  date: Date;
  restaurants: RestaurantProps[];
}

export interface RestaurantGridProps {
  restaurants: RestaurantProps[];
}

export interface RestaurantProps {
  title: string;
  url: string;
  imgUrl?: string;
  dishCollection?: DishCollectionProps[];
  longitude: number;
  latitude: number;
  distance: number;
  googleMapsUrl: string;
  unknownMealDefault?: 'veg';
}

export interface DishCollectionProps {
  language: string;
  dishes: DishProps[];
}

export interface DishProps {
  type: DishType;
  title: string;
  description?: string;
}

export type DishType = 'meat' | 'fish' | 'veg' | 'vegan' | 'misc';
