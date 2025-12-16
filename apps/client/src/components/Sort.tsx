import { css } from '@emotion/react';

import SortIcon from '@/assets/sort.svg?react';
import { useRestaurants } from '@/hooks/useRestaurants';
import { color } from '@/utils/theme';
import { sortRestaurants } from '@/utils/sort-restaurants';

import Button from './Button';

const sortStyles = css``;

const sortButtonStyles = css`
  &[aria-pressed='true'] {
    background-color: ${color.orange};
    color: ${color.white};
  }
`;

const sortIconStyles = css`
  width: 0.75rem;
  margin-right: 0.375rem;
  fill: ${color.blue};
`;

export default function Sort() {
  const { restaurants, setRestaurants, setUserPosition, userPosition } = useRestaurants();

  const processLocation = (position: { coords: { latitude: number; longitude: number } }) => {
    const userCoord = { lat: position.coords.latitude, lon: position.coords.longitude };
    setUserPosition(userCoord);
    const sortedRestaurants = sortRestaurants(restaurants, userCoord);
    setRestaurants(sortedRestaurants);
  };

  const sortOnLocation = () => {
    // Toggle off -> back to office
    if (userPosition) {
      setUserPosition(null);
      const sortedRestaurants = sortRestaurants(restaurants);
      setRestaurants(sortedRestaurants);
      return;
    }

    if (!navigator.geolocation) {
      const sortedRestaurants = sortRestaurants(restaurants);
      setRestaurants(sortedRestaurants);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        processLocation(pos);
      },
      () => {
        const sortedRestaurants = sortRestaurants(restaurants);
        setRestaurants(sortedRestaurants);
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
      <Button css={sortButtonStyles} onClick={sortOnLocation} aria-pressed={!!userPosition}>
        <SortIcon css={sortIconStyles} />
        {userPosition ? 'Sorted by my location' : 'Sort by my location'}
      </Button>
    </div>
  );
}
