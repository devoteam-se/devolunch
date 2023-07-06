import React from 'react';
import { css, keyframes } from '@emotion/react';

import { ReactComponent as SortIcon } from '@/assets/sort.svg';
import { useRestaurants } from '@/contexts/restaurants';
import { distance } from '@/utils/distance';
import { color } from '@/utils/theme';

import { DishCollectionProps, RestaurantProps } from '@devolunch/shared';
import Button from './Button';

const activeKeyFrame = keyframes`
	0% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
	}

	70% {
		transform: scale(1);
		box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
	}

	100% {
		transform: scale(0.95);
		box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
	}
`;

const sortStyles = css`
  margin-right: 1rem;
`;

const sortButtonStyles = css`
  &[data-active='1'] {
    background-color: ${color.orange};
    animation: ${activeKeyFrame} 1s infinite;
  }
`;

const sortIconStyles = css`
  width: 0.75rem;
  margin-right: 0.375rem;
  fill: ${color.blue};
`;

export default function Sort() {
  const { restaurants, setRestaurants } = useRestaurants();
  const [active, setActive] = React.useState(0);

  const sortOnLocation = () => {
    setActive(1);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setRestaurants(
          restaurants
            .map((r: RestaurantProps) => ({
              ...r,
              distance: distance(latitude, r.latitude, longitude, r.longitude),
            }))
            .sort(
              (a: RestaurantProps, b: RestaurantProps) =>
                b.dishCollection.filter((d: DishCollectionProps) => d.dishes?.length).length -
                  a.dishCollection.filter((d: DishCollectionProps) => d.dishes?.length).length ||
                a.distance - b.distance,
            ),
        );
        setActive(0);
      },
      () => {
        setActive(0);
      },
    );
  };

  return (
    <div css={sortStyles}>
      <Button css={sortButtonStyles} onClick={sortOnLocation} onAnimationEnd={() => setActive(0)} data-active={active}>
        <SortIcon css={sortIconStyles} />
        Sort by my location
      </Button>
    </div>
  );
}
