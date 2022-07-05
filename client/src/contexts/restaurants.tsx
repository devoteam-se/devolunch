import React, { useContext, useEffect, useState } from "react";

type ContextType = {
  loading: boolean;
  scrapeDate: Date;
  language: string;
  setLanguage: (language: string) => void;
  restaurants: App.Restaurant[];
};

enum Endpoints {
  RESTAURANTS = "/restaurants",
}

const API_ROOT_PROD = "/api";
const API_ROOT_DEV = "http://localhost:8080/api";

const RestaurantsContext = React.createContext<ContextType | null>(null);

const isDev = process.env.NODE_ENV === "development";

export const useRestaurants = () => {
  const context = useContext(RestaurantsContext);
  if (!context) {
    throw new Error("context not defined");
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
  const [language, setLanguage] = useState<string>("sv");
  const [restaurants, setRestaurants] = useState<App.Restaurant[]>([]);
  const [scrapeDate, setScrapeDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const get = async () => {
      const language = new URLSearchParams(window.location.search).get("lang");

      setLoading(true);
      if (language) {
        setLanguage(language);
      }
      const r = await fetchRestaurants();
      setRestaurants(r.restaurants);
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
      value={{ setLanguage, language, scrapeDate, restaurants, loading }}
    >
      {children}
    </RestaurantsContext.Provider>
  );
};

export default RestaurantsProvider;
