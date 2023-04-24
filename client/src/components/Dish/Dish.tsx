import "./Dish.css";

export const Dish = ({ type, description }: App.Dish) => {
  // const { isFish } = useIsFish(description);

  return (
    <div className="dish">
      <h3 className="dish-title">
        <div
          className="dish-title-icon"
          data-veg={type === "veg"}
          data-fish={type === "fish"}
          data-misc={type === "misc"}
        />
        {type}
      </h3>
      <p className="dish-description">{description}</p>
    </div>
  );
};
