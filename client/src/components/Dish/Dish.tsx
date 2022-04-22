import { ReactComponent as Icon } from '../../assets/sun.svg';
import './Dish.css';

export const Dish = ({ type, description }: App.Dish) => {
  // const { isFish } = useIsFish(description);

  return (
    <div className="dish">
      <div className="dish-title-wrapper">
        <p className="dish-title">{type}</p>
        <Icon
          className="dish-title-icon"
          data-veg={type === 'veg'}
          data-fish={type === 'fish'}
        />
      </div>
      <p className="dish-descr">{description}</p>
    </div>
  );
};
