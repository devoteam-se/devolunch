import { css } from '@emotion/react';

import Restaurant from '@/components/Restaurant';
import { screenSize } from '@/utils/theme';

import { RestaurantGridProps, RestaurantProps } from '@devolunch/shared';

const restaurantListStyles = css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  justify-content: space-evenly;
  align-items: flex-start;
  row-gap: 2rem;
  column-gap: 2rem;
  animation-name: load;
  animation-duration: 1s;

  @media only screen and (max-width: ${screenSize.large}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media only screen and (max-width: ${screenSize.medium}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (max-width: ${screenSize.small}) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

export default function RestaurantGrid({ restaurants }: RestaurantGridProps) {
  return (
    <div css={restaurantListStyles}>
      {restaurants?.map((restaurant: RestaurantProps, index: number) => (
        <Restaurant
          key={`rest-${index}`}
          title={restaurant.title}
          imageUrl={restaurant.imageUrl}
          imageUrlLowQuality={restaurant.imageUrlLowQuality}
          distance={restaurant.distance}
          coordinate={restaurant.coordinate}
          url={restaurant.url}
          dishCollection={restaurant.dishCollection}
          googleMapsUrl={restaurant.googleMapsUrl}
        />
      ))}
    </div>
  );
}
