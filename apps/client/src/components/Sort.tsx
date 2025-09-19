import React from 'react';
import { css, keyframes } from '@emotion/react';

import SortIcon from '@/assets/sort.svg?react';
import { useRestaurants } from '@/hooks/useRestaurants';
import { color } from '@/utils/theme';
import { sortRestaurants } from '@/utils/sort-restaurants';

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
  const { restaurants, setRestaurants, setUserPosition } = useRestaurants();
  const [active, setActive] = React.useState(0);

  const processLocation = (position: { coords: { latitude: number; longitude: number } }) => {
    const userCoord = { lat: position.coords.latitude, lon: position.coords.longitude };
    setUserPosition(userCoord);
    const sortedRestaurants = sortRestaurants(restaurants, userCoord);
    setRestaurants(sortedRestaurants);
    setActive(0);
  };

  const sortOnLocation = () => {
    setActive(1);

    if (!navigator.geolocation) {
      // Fallback to default location silently
      const sortedRestaurants = sortRestaurants(restaurants);
      setRestaurants(sortedRestaurants);
      setActive(0);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      processLocation,
      () => {
        // On any error, fallback to default location silently
        const sortedRestaurants = sortRestaurants(restaurants);
        setRestaurants(sortedRestaurants);
        setActive(0);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
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
