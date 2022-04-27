import { Dish } from "../Dish/Dish";
import { ReactComponent as ArrowIcon } from "../../assets/arrow.svg";
import "./Restaurant.css";

export const Restaurant = ({
  title,
  description,
  url,
  imgUrl,
  dishes,
}: App.Restaurant) => {
  return (
    <div className="restaurant">
      <a href={url}>
        <div className="rest-wrapper">
          <p className="rest-title">{title}</p>
          <p className="rest-descr">{description}</p>
        </div>
        <div className="restaurant-image-wrapper">
          <img src={imgUrl} className="restaurant-image" alt="res" />
          <ArrowIcon className="restaurant-arrow" />
        </div>
      </a>
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
