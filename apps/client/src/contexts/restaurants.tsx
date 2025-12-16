import React, { useEffect, useState } from 'react';

import { RestaurantProps, Coordinate } from '@devolunch/shared';
import { RestaurantsContext } from './RestaurantsContext';
import { sortRestaurants } from '@/utils/sort-restaurants';
import { fetchRestaurants } from '@/utils/api';
import { APP_CONFIG } from '@/utils/constants';
import { getUrlParam } from '@/utils/common';

const RestaurantsProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<string>(APP_CONFIG.DEFAULT_LANGUAGE);
  const [restaurants, setRestaurants] = useState<RestaurantProps[]>([]);
  const [scrapeDate, setScrapeDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [realPosition] = useState<boolean>(false);
  const [userPosition, setUserPosition] = useState<Coordinate | null>(null);

  useEffect(() => {
    const get = async () => {
      const urlLanguage = getUrlParam('lang');

      setLoading(true);
      if (urlLanguage) {
        setLanguage(urlLanguage);
      }

      const data = await fetchRestaurants();

      if (data) {
        setRestaurants(sortRestaurants(data.restaurants));
        setScrapeDate(new Date(data.date));
      }
      setLoading(false);
    };

    get();

    const intervalId = setInterval(get, APP_CONFIG.REFRESH_INTERVAL_MS);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
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
