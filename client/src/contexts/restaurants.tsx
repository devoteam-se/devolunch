import React, { useContext } from "react";
import { useAsync } from "react-use";

type ContextType = {
  loading: boolean;
  restaurants: App.Restaurant[];
};

enum Endpoints {
  RESTAURANTS = "/restaurants",
}

const API_ROOT_PROD = "https://lunch.jayway.com/api";
const API_ROOT_DEV = "https://lunch.jayway.com/api";

const RestaurantsContext = React.createContext<ContextType | null>(null);

const isDev = process.env.NODE_ENV === "development";

export const useRestaurants = () => {
  const context = useContext(RestaurantsContext);
  if (!context) {
    throw new Error("context not defined");
  }
  return context;
};

const RestaurantsProvider = ({ children }: any) => {
  const rootUrl = isDev ? API_ROOT_DEV : API_ROOT_PROD;
  const { loading, value, error } = useAsync(async () => {
    const res = await fetch(`${rootUrl}${Endpoints.RESTAURANTS}`);
    const data = await res.json();
    return data;
  });

  if (error) {
    console.error(error);
    return null;
  }

  return (
    <RestaurantsContext.Provider value={{ restaurants: value || [], loading }}>
      {children}
    </RestaurantsContext.Provider>
  );
};

export default RestaurantsProvider;
