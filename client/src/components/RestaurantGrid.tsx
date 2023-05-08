import { css } from '@emotion/react';

import Restaurant from '@/components/Restaurant';

const restaurantListStyles = css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  justify-content: space-evenly;
  align-items: flex-start;
  row-gap: 2rem;
  column-gap: 2rem;
  animation-name: load;
  animation-duration: 1s;

  @media only screen and (max-width: 1088px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media only screen and (max-width: 832px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

interface RestaurantListI {
  restaurants: App.Restaurant[];
}

export default function RestaurantGrid({ restaurants }: RestaurantListI) {
  return (
    <div css={restaurantListStyles}>
      {restaurants.map((restaurant, index) => (
        <Restaurant
          key={`rest-${index}`}
          title={restaurant.title}
          distance={restaurant.distance}
          latitude={restaurant.latitude}
          longitude={restaurant.longitude}
          url={restaurant.url}
          imgUrl={restaurant.imgUrl}
          dishCollection={restaurant.dishCollection}
          googleMapsUrl={restaurant.googleMapsUrl}
        />
      ))}
    </div>
  );
}
