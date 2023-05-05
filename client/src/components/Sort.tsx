import { css } from "@emotion/react";

import { useRestaurants } from "@/contexts/restaurants";
import { distance } from "@/utils/distance";

const sortStyles = css`
  margin-right: 1rem;
`;

const sortButtonStyles = css`
  background-color: #fff;
  padding: 0.375rem 0.5rem;
  border: 1px solid #000;
  border-radius: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #ffaa5b;
  }
`;

export default () => {
  const { restaurants, setRestaurants } = useRestaurants();

  const sortOnLocation = () => {
    navigator.geolocation.getCurrentPosition(function (position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setRestaurants(
        restaurants
          .map((r: App.Restaurant) => ({
            ...r,
            distance: distance(latitude, r.latitude, longitude, r.longitude),
          }))
          .sort((a: App.Restaurant, b: App.Restaurant) => a.distance - b.distance)
      );

      window.localStorage.setItem("position", `${latitude},${longitude}`);
    });
  };

  return (
    <div css={sortStyles}>
      <button css={sortButtonStyles} onClick={sortOnLocation}>
        Sort by my location
      </button>
    </div>
  );
};
