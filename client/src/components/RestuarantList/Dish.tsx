import { ReactComponent as Icon } from "../../assets/sun.svg";

export const Dish = ({ type, description }: App.Dish) => {
  return (
    <div className="dish">
      <div className="dish-title-wrapper">
        <p className="dish-title">{type}</p>
        <Icon className="dish-title-icon" data-veg={type === "veg"} />
      </div>
      <p className="dish-descr">{description}</p>
    </div>
  );
};
