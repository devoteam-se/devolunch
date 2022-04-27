import { Restaurant } from "../Restaurant/Restaurant";
import "./restaurantList.css";

interface RestaurantListI {
  restaurants: App.Restaurant[];
}

export const RestaurantList = ({ restaurants }: RestaurantListI) => {
  return (
    <div className="restaurant-list">
      {restaurants.map((restaurant, index) => (
        <Restaurant
          key={`rest-${index}`}
          title={restaurant.title}
          description={restaurant.description}
          url={restaurant.url}
          imgUrl={restaurant.imgUrl}
          dishes={restaurant.dishes}
        />
      ))}
    </div>
  );
};
