import { Dish } from './Dish';

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
      <img src={imgUrl} className="restaurant-image" alt="res" />
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
