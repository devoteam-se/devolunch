import React, { useContext } from "react";
import { useAsync } from "react-use";

type ContextType = {
  loading: boolean;
  restaurants: App.Restaurant[];
};

const RestaurantsContext = React.createContext<ContextType | null>(null);

export const useRestaurants = () => {
  const context = useContext(RestaurantsContext);
  if (!context) {
    throw new Error("context not defined");
  }
  return context;
};

const RestaurantsProvider = ({ children }: any) => {
  const { loading, value, error } = useAsync(async () => {
    const res = await fetch("http://localhost:8080/api"); // TODO: Use prod endpoint
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
