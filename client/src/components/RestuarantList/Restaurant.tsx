import { Dish } from "./Dish";
import { ReactComponent as ArrowIcon } from "../../assets/arrow.svg";

export const Restaurant = ({
  title,
  description,
  imgUrl,
  dishes,
}: App.Restaurant) => {
  return (
    <div className="restaurant">
      <div className="rest-wrapper">
        <p className="rest-title">{title}</p>
        <p className="rest-descr">{description}</p>
      </div>
      <div className="restaurant-image-wrapper">
        <img src={imgUrl} className="restaurant-image" alt="res" />
        <ArrowIcon className="restaurant-arrow" />
      </div>
      {dishes.map((dish, index) => (
        <Dish
          key={`dish-${index}`}
          type={dish.type}
          description={dish.description}
        />
      ))}
    </div>
  );
};
