import { DishI } from '../../models/api';

export const Dish = ({ type, description }: DishI) => {
  return (
    <div className="dish">
      <div className="dish-title-wrapper">
        <p className="dish-title">{type}</p>
        <p className="dish-title-icon">Icon</p>
      </div>
      <p className="dish-descr">{description}</p>
    </div>
  );
};
