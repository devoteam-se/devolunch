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
  dishCollection: DishCollectionProps[];
  longitude: number;
  latitude: number;
  distance: number;
  googleMapsUrl: string;
}

export interface DishCollectionProps {
  language: string;
  dishes: DishProps[];
}

export interface DishProps {
  type: DishType;
  description: string | null | undefined;
}

export type DishType = 'meat' | 'fish' | 'veg' | 'misc';
