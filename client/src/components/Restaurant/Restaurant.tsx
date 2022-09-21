import { Dish } from "../Dish/Dish";
import { ReactComponent as ArrowIcon } from "../../assets/arrow.svg";
import "./Restaurant.css";
import { useRestaurants } from "../../contexts/restaurants";

export const Restaurant = ({
  title,
  distance,
  url,
  imgUrl,
  dishCollection,
}: App.Restaurant) => {
  const { language } = useRestaurants();

  return (
    <div className="restaurant">
      <a href={url}>
        <div className="rest-wrapper">
          <p className="rest-title">{title}</p>
          <p className="rest-distance">{distance?.toFixed(2)} km</p>
        </div>
        <div className="restaurant-image-wrapper">
          <img src={imgUrl} className="restaurant-image" alt="res" />
          <ArrowIcon className="restaurant-arrow" />
        </div>
      </a>
      {dishCollection
        .find((dc) => dc.language === language)
        ?.dishes.map((dish, index) => (
          <Dish
            key={`dish-${index}`}
            type={dish.type}
            description={dish.description}
          />
        ))}
    </div>
  );
};
