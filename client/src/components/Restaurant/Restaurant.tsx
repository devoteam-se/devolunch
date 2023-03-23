import { Dish } from "../Dish/Dish";
import { ReactComponent as LocationIcon } from "../../assets/location.svg";
import { ReactComponent as ExternalLinkIcon } from "../../assets/external-link.svg";
import { ReactComponent as DirectionIcon } from "../../assets/direction.svg";
import "./Restaurant.css";
import { useRestaurants } from "../../contexts/restaurants";

export const Restaurant = ({ title, distance, url, imgUrl, dishCollection, latitude, longitude }: App.Restaurant) => {
  const { language } = useRestaurants();

  return (
    <div className="restaurant">
      <a href={url}>
        <div className="rest-wrapper">
          <p className="rest-title">{title}</p>
          <p className="rest-distance">
            <LocationIcon className="location-icon" />
            {distance?.toFixed(2)} km
          </p>
        </div>
        <div className="restaurant-image-wrapper">
          <img src={imgUrl} className="restaurant-image" alt="res" />
        </div>
      </a>
      {dishCollection
        .find((dc) => dc.language === language)
        ?.dishes.map((dish, index) => (
          <Dish key={`dish-${index}`} type={dish.type} description={dish.description} />
        ))}
      <div className="rest-links">
        <a href={url} className="website">
          <ExternalLinkIcon className="rest-links-icon" />
          Website
        </a>
        <a href={`https://maps.google.com/?q=${latitude},${longitude}`} className="direction">
          <DirectionIcon className="rest-links-icon" />
          Directions
        </a>
      </div>
    </div>
  );
};
