import { LanguageSelector } from "../LanguageSelector/LanguageSelector";
import { RestaurantList } from "../RestuarantList";

import "./Main.css";

interface RestaurantListI {
  restaurants: App.Restaurant[];
}

export const Main = ({ restaurants }: RestaurantListI) => {
  return (
    <div className="main">
      <LanguageSelector />
      <RestaurantList restaurants={restaurants} />
    </div>
  );
};
