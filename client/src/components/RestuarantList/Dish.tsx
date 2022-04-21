import { ReactComponent as Icon } from "../../assets/sun.svg";
import { useIsFish } from "../../hooks/useIsFish";

export const Dish = ({ type, description }: App.Dish) => {
  const { isFish } = useIsFish(description);

  return (
    <div className="dish">
      <div className="dish-title-wrapper">
        <p className="dish-title">{isFish ? 'Fisk' : type}</p>
        <Icon className="dish-title-icon" data-veg={type === "veg"} data-fish={isFish}/>
      </div>
      <p className="dish-descr">{description}</p>
    </div>
  );
};
