import { RestaurantI } from '../../models/api';
import { Dish } from './Dish';

export const Restaurant = ({
  title,
  description,
  imgUrl,
  dishes,
}: RestaurantI) => {
  return (
    <div className="restaurant">
      <div className="rest-wrapper">
        <p className="rest-title">{title}</p>
        <p className="rest-descr">{description}</p>
      </div>
      <img src={imgUrl} className="restaurant-image" alt="res" />
      {dishes.map((dish) => (
        <Dish type={dish.type} description={dish.description} />
      ))}
    </div>
  );
};
