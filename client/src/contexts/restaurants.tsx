import React, { useContext, useEffect, useState } from "react";
import { useAsync } from "react-use";

type ContextType = {
  loading: boolean;
  restaurants: App.Restaurant[];
};

enum Endpoints {
  RESTAURANTS = "/restaurants",
}

const API_ROOT_PROD = "https://lunch.jayway.com/api";
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
  return data as App.Restaurant[];
};

const RestaurantsProvider = ({ children }: any) => {
  const [restaurants, setRestaurants] = useState<App.Restaurant[]>([]);

  useEffect(() => {
    const initialFetch = async () => {
      const r = await fetchRestaurants();
      setRestaurants(r);
    };
    initialFetch();
  }, []);

  const { loading, error } = useAsync(async () => {
    setInterval(async () => {
      const data = await fetchRestaurants();
      setRestaurants(data);
    }, 60000);
  });

  if (error) {
    console.error(error);
    return null;
  }

  return (
    <RestaurantsContext.Provider value={{ restaurants, loading }}>
      {children}
    </RestaurantsContext.Provider>
  );
};

export default RestaurantsProvider;
