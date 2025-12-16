import React from 'react';
import { RestaurantProps, Coordinate } from '@devolunch/shared';

export type RestaurantsContextType = {
  loading: boolean;
  scrapeDate: Date | null;
  realPosition: boolean;
  language: string;
  setLanguage: (language: string) => void;
  restaurants: RestaurantProps[];
  setRestaurants: (restaurants: RestaurantProps[]) => void;
  userPosition: Coordinate | null;
  setUserPosition: (position: Coordinate | null) => void;
};

export const RestaurantsContext = React.createContext<RestaurantsContextType | null>(null);