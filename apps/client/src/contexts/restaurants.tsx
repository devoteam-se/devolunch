import React, { useContext, useEffect, useState } from 'react';

import { distance } from '@/utils/distance';
import { DishCollectionProps, RestaurantProps, Scrape } from '@devolunch/shared';

type ContextType = {
  loading: boolean;
  scrapeDate: Date | null;
  realPosition: boolean;
  language: string;
  setLanguage: (language: string) => void;
  restaurants: RestaurantProps[];
  setRestaurants: (restaurants: RestaurantProps[]) => void;
};

enum Endpoints {
  RESTAURANTS = '/restaurants',
}

const API_ROOT_PROD = '/api/v1';
const API_ROOT_DEV = 'http://localhost:8080/api/v1';

const RestaurantsContext = React.createContext<ContextType | null>(null);

const isDev = import.meta.env.DEV;

export const useRestaurants = () => {
  const context = useContext(RestaurantsContext);
  if (!context) {
    throw new Error('context not defined');
  }
  return context;
};

const rootUrl = isDev ? API_ROOT_DEV : API_ROOT_PROD;

const fetchRestaurants = async () => {
  try {
    const res = await fetch(`${rootUrl}${Endpoints.RESTAURANTS}`);
    const data = await res.json();
    return data as Scrape;
  } catch (err) {
    return null;
  }
};

const RestaurantsProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<string>('sv');
  const [restaurants, setRestaurants] = useState<RestaurantProps[]>([]);
  const [scrapeDate, setScrapeDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [realPosition] = useState<boolean>(false);

  useEffect(() => {
    const get = async () => {
      const language = new URLSearchParams(window.location.search).get('lang');

      setLoading(true);
      if (language) {
        setLanguage(language);
      }

      const latitude = 55.61282608776878;
      const longitude = 13.003325575170862;

      const r = await fetchRestaurants();

      if (r) {
        setRestaurants(
          r.restaurants
            .map((r: RestaurantProps) => ({
              ...r,
              distance: distance(latitude, r.latitude, longitude, r.longitude),
            }))
            .sort(
              (a: RestaurantProps, b: RestaurantProps) =>
                b.dishCollection.filter((d: DishCollectionProps) => d.dishes?.length).length -
                  a.dishCollection.filter((d: DishCollectionProps) => d.dishes?.length).length ||
                a.distance - b.distance,
            ),
        );
        setScrapeDate(new Date(r.date));
      }
      setLoading(false);
    };

    get();

    setInterval(async () => {
      await get();
    }, 3600000);
  }, []);

  return (
    <RestaurantsContext.Provider
      value={{
        language,
        setLanguage,
        realPosition,
        scrapeDate,
        restaurants,
        setRestaurants,
        loading,
      }}
    >
      {children}
    </RestaurantsContext.Provider>
  );
};

export default RestaurantsProvider;
