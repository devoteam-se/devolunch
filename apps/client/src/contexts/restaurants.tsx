import React, { useContext, useEffect, useState } from 'react';

import { RestaurantProps, Scrape, Coordinate } from '@devolunch/shared';
import { sortRestaurants } from '@/utils/sort-restaurants';

type ContextType = {
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

// Request deduplication to prevent duplicate API calls
let requestInProgress = false;
let cachedRequest: Promise<Scrape | null> | null = null;

const fetchRestaurants = async (): Promise<Scrape | null> => {
  // If a request is already in progress, return the same promise
  if (requestInProgress && cachedRequest) {
    return cachedRequest;
  }

  // Mark request as in progress and cache the promise
  requestInProgress = true;
  cachedRequest = (async () => {
    try {
      const res = await fetch(`${rootUrl}${Endpoints.RESTAURANTS}`);
      const data = await res.json();
      return data as Scrape;
    } catch (_err) {
      return null;
    } finally {
      // Reset flags after request completes
      requestInProgress = false;
      cachedRequest = null;
    }
  })();

  return cachedRequest;
};

const RestaurantsProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<string>('sv');
  const [restaurants, setRestaurants] = useState<RestaurantProps[]>([]);
  const [scrapeDate, setScrapeDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [realPosition] = useState<boolean>(false);
  const [userPosition, setUserPosition] = useState<Coordinate | null>(null);

  useEffect(() => {
    const get = async () => {
      const language = new URLSearchParams(window.location.search).get('lang');

      setLoading(true);
      if (language) {
        setLanguage(language);
      }

      const r = await fetchRestaurants();

      if (r) {
        setRestaurants(sortRestaurants(r.restaurants));
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
        userPosition,
        setUserPosition,
      }}
    >
      {children}
    </RestaurantsContext.Provider>
  );
};

export default RestaurantsProvider;
