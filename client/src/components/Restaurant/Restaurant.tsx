import { Dish } from "../Dish/Dish";
import { ReactComponent as LocationIcon } from "../../assets/location.svg";
import { ReactComponent as ExternalLinkIcon } from "../../assets/external-link.svg";
import { ReactComponent as DirectionIcon } from "../../assets/direction.svg";
import "./Restaurant.css";
import { useRestaurants } from "../../contexts/restaurants";

export const Restaurant = ({ title, distance, url, imgUrl, dishCollection, googleMapsUrl }: App.Restaurant) => {
  const { language } = useRestaurants();

  return (
    <div className="restaurant">
      <a href={url}>
        <h2 className="restaurant-title">{title}</h2>
        <div className="restaurant-distance">
          <LocationIcon className="location-icon" />
          {distance?.toFixed(2)} km
        </div>
        <img src={imgUrl} className="restaurant-image" alt="res" />
      </a>
      {dishCollection
        .find((dc) => dc.language === language)
        ?.dishes.map((dish, index) => (
          <Dish key={`dish-${index}`} type={dish.type} description={dish.description} />
        ))}
      <div className="restaurant-links">
        <a href={url} className="website">
          <ExternalLinkIcon className="restaurant-links-icon" />
          Website
        </a>
        <a href={googleMapsUrl} className="direction">
          <DirectionIcon className="restaurant-links-icon" />
          Directions
        </a>
      </div>
    </div>
  );
};
