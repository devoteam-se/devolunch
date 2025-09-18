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
  imageUrl: string;
  imageUrlLowQuality?: string;
  dishCollection?: DishCollectionProps[];
  coordinate: Coordinate;
  distance?: number;
  googleMapsUrl: string;
  unknownMealDefault?: 'veg';
  locationFilter?: string;
  locations?: RestaurantLocation[]; // For multi-location restaurants
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

export interface Coordinate {
  lat: number;
  lon: number;
}

export type DishType = 'meat' | 'fish' | 'veg' | 'vegan' | 'misc';

export interface RestaurantLocation {
  title: string;
  googleMapsUrl: string;
  coordinate: Coordinate;
  url?: string; // Only for 'separate' type
  locationFilter?: string; // For 'filtered' and 'separate' types
  dishCollection?: DishCollectionProps[];
}

export interface MultiLocationConfig {
  type: 'shared' | 'filtered' | 'separate';
  locations: RestaurantLocation[];
}

export interface RestaurantMetaProps extends Omit<RestaurantProps, 'imageUrlLowQuality'> {
  useContentCleaner?: boolean;
  multiLocation?: MultiLocationConfig;
}
