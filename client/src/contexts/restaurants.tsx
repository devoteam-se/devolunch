import { distance } from '@/utils/distance';
import React, { useContext, useEffect, useState } from 'react';

type ContextType = {
  loading: boolean;
  scrapeDate: Date;
  realPosition: boolean;
  language: string;
  setLanguage: (language: string) => void;
  restaurants: App.Restaurant[];
  setRestaurants: (restaurants: App.Restaurant[]) => void;
};

enum Endpoints {
  RESTAURANTS = '/restaurants',
}

const API_ROOT_PROD = '/api';
const API_ROOT_DEV = 'http://localhost:8080/api';

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
  const res = await fetch(`${rootUrl}${Endpoints.RESTAURANTS}`);
  const data = await res.json();
  return data as App.Scrape;
};

const RestaurantsProvider = ({ children }: any) => {
  const [language, setLanguage] = useState<string>('sv');
  const [restaurants, setRestaurants] = useState<App.Restaurant[]>([]);
  const [scrapeDate, setScrapeDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [realPosition] = useState<boolean>(false);

  useEffect(() => {
    const get = async () => {
      const language = new URLSearchParams(window.location.search).get('lang');

      setLoading(true);
      if (language) {
        setLanguage(language);
      }

      const position = window.localStorage.getItem('position')?.split(',');

      const savedLatitude = position?.length === 2 && parseFloat(position[0]);
      const savedLongitude = position?.length === 2 && parseFloat(position[1]);

      let latitude = 55.61282608776878;
      let longitude = 13.003325575170862;

      if (savedLatitude && savedLongitude) {
        latitude = savedLatitude;
        longitude = savedLongitude;
      }

      const r = await fetchRestaurants();

      setRestaurants(
        r.restaurants
          .map((r: App.Restaurant) => ({
            ...r,
            distance: distance(latitude, r.latitude, longitude, r.longitude),
          }))
          .sort((a: App.Restaurant, b: App.Restaurant) => a.distance - b.distance),
      );
      setScrapeDate(new Date(r.date));
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
