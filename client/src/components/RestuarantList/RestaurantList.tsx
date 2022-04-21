import { RestaurantI } from '../../models/api';
import { Restaurant } from './Restaurant';

interface RestaurantListI {
  restaurants: RestaurantI[];
}

export const RestaurantList = ({ restaurants }: RestaurantListI) => {
  console.log(restaurants);

  return (
    <div className="restaurant-list">
      {restaurants.map((restaurant) => (
        <Restaurant
          title={restaurant.title}
          description={restaurant.description}
          imgUrl={restaurant.imgUrl}
          dishes={restaurant.dishes}
        />
      ))}
    </div>
  );
};
