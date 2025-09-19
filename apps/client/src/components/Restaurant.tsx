import { css } from '@emotion/react';

import Dish from '@/components/Dish';

import LocationIcon from '@/assets/location.svg?react';
import ExternalLinkIcon from '@/assets/external-link.svg?react';
import DirectionIcon from '@/assets/direction.svg?react';
import { useRestaurants } from '@/contexts/restaurants';
import { color } from '@/utils/theme';
import { calculateDistance } from '@/utils/distance';
import { DEVOTEAM_LOCATION } from '@/utils/constants';

import { RestaurantProps, DishCollectionProps, DishProps } from '@devolunch/shared';
import { useProgressiveImg } from '@/hooks/progressive-image';
import { useState, useEffect } from 'react';

const restaurantStyles = css`
  display: flex;
  flex-direction: column;
  padding: 0;
`;

const titleContainerStyles = css`
  display: flex;
  align-items: center;
  padding: 0;
  min-height: 3rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${color.black};
  margin-bottom: 0.75rem;
`;

const restaurantTitleStyles = css`
  white-space: pre-wrap;
  color: ${color.black};
  font-family: 'Azeret Mono', monospace;
  font-weight: 500;
  font-size: 1.25rem;
  margin: 0;
  flex: 1;
`;

const restaurantDistanceStyles = css`
  display: flex;
  align-items: center;
  color: ${color.black};
  margin: 0.75rem 0;
`;

const restaurantLocationIconStyles = css`
  margin-right: 0.25rem;
  width: 1rem;
`;

const restaurantImageLinkStyles = css`
  text-decoration: none;
  background-color: ${color.white};
  color: ${color.black};
  height: 14rem;
  margin-bottom: 0.25rem;
`;

const restaurantImageStyles = css`
  width: 100%;
  height: 100%;
  border-radius: 0.625rem;
  margin: 0 auto;
  object-fit: cover;
`;

const unableToScrapeStyles = css`
  padding: 0.75rem 0;
  border-bottom: 1px solid ${color.black};
`;

const restaurantLinksStyles = css`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;

  & > a {
    display: flex;
    align-items: center;
    color: ${color.blue};
    background-color: ${color.white};
    border: 1px solid ${color.blue};
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    margin-left: 0.5rem;
    text-decoration: none;
  }

  & > a:hover {
    background-color: ${color.orange};
  }
`;

const restaurantWebsiteIconStyles = css``;

const restaurantLinksIconStyles = css`
  width: 0.75rem;
  margin-right: 0.375rem;
  fill: ${color.blue};
`;

const restaurantDirectionStyles = css``;

const showMoreContainerStyles = css`
  display: flex;
  justify-content: flex-start;
  margin-top: 0.5rem;
`;

const showMoreButtonStyles = css`
  display: inline-flex;
  align-items: center;
  color: ${color.blue};
  background-color: ${color.white};
  border: 1px solid ${color.blue};
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    background-color: ${color.orange};
  }
`;

const locationInfoContainerStyles = css``;

const locationDistanceStyles = css`
  display: flex;
  align-items: center;
  color: ${color.black};
  margin: 0.75rem 0;
`;

const cycleButtonStyles = css`
  background: none;
  border: none;
  color: ${color.blackOlive};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${color.blackOlive};
    color: ${color.white};
    border-radius: 0.25rem;
  }

  &:disabled {
    color: ${color.blackOlive};
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export default function Restaurant({
  title,
  imageUrl,
  imageUrlLowQuality,
  url,
  dishCollection,
  googleMapsUrl,
  locations,
  coordinate,
}: RestaurantProps) {
  const { loading, language, userPosition } = useRestaurants();
  const { src, blur } = useProgressiveImg(imageUrlLowQuality, imageUrl);
  const [expanded, setExpanded] = useState(false);
  // Find the closest location index if user position is available
  const getClosestLocationIndex = () => {
    if (!locations || !userPosition) return 0;

    const distances = locations.map((loc) => calculateDistance(userPosition, loc.coordinate));
    return distances.indexOf(Math.min(...distances));
  };

  const [currentLocationIndex, setCurrentLocationIndex] = useState(() => getClosestLocationIndex());

  // Update location index when user position changes
  useEffect(() => {
    if (userPosition && locations) {
      const distances = locations.map((loc) => calculateDistance(userPosition, loc.coordinate));
      const closestIndex = distances.indexOf(Math.min(...distances));
      setCurrentLocationIndex(closestIndex);
    }
  }, [userPosition, locations]);

  // For multi-location restaurants, use the current location data
  const isMultiLocation = locations && locations.length >= 1;
  const hasMultipleLocations = locations && locations.length > 1;
  const currentLocation = isMultiLocation ? locations[currentLocationIndex] : null;
  const currentUrl = currentLocation?.url || url;
  const currentGoogleMapsUrl = currentLocation?.googleMapsUrl || googleMapsUrl;
  const currentDishCollection = currentLocation?.dishCollection || dishCollection;

  // Calculate distance for current location if multi-location
  const currentDistance = (() => {
    const referencePosition = userPosition || DEVOTEAM_LOCATION;

    if (currentLocation) {
      // For multi-location: calculate distance to the specific location
      return calculateDistance(referencePosition, currentLocation.coordinate);
    } else {
      // For single location: calculate distance to main coordinate
      return calculateDistance(referencePosition, coordinate);
    }
  })();

  const distanceText = loading
    ? ' '
    : currentDistance && currentDistance < 1
    ? `${(currentDistance * 1000)?.toFixed(0)} m`
    : `${currentDistance?.toFixed(2)} km`;

  const nextLocation = () => {
    if (hasMultipleLocations) {
      setCurrentLocationIndex((prev) => (prev + 1) % locations!.length);
    }
  };

  const prevLocation = () => {
    if (hasMultipleLocations) {
      setCurrentLocationIndex((prev) => (prev - 1 + locations!.length) % locations!.length);
    }
  };

  return (
    <div css={restaurantStyles}>
      <div css={titleContainerStyles}>
        {isMultiLocation && hasMultipleLocations && !loading && (
          <button css={cycleButtonStyles} onClick={prevLocation} disabled={!hasMultipleLocations}>
            ←
          </button>
        )}
        <h2 css={restaurantTitleStyles}>{loading ? ' ' : title}</h2>
        {isMultiLocation && hasMultipleLocations && !loading && (
          <button css={cycleButtonStyles} onClick={nextLocation} disabled={!hasMultipleLocations}>
            →
          </button>
        )}
      </div>

      {isMultiLocation && !loading && (
        <div css={locationInfoContainerStyles}>
          <div css={locationDistanceStyles}>
            <LocationIcon css={restaurantLocationIconStyles} />
            {distanceText} • {currentLocation?.title}
          </div>
        </div>
      )}

      {!isMultiLocation && (
        <div css={restaurantDistanceStyles}>
          <LocationIcon css={restaurantLocationIconStyles} />
          {!loading && distanceText}
        </div>
      )}
      <a href={currentUrl} css={restaurantImageLinkStyles}>
        <img
          src={src}
          style={{
            filter: blur ? 'blur(20px)' : 'none',
            transition: blur ? 'none' : 'filter 0.3s ease-out',
          }}
          css={restaurantImageStyles}
          alt={title}
        />
      </a>
      {currentDishCollection && currentDishCollection.filter((a: DishCollectionProps) => a.dishes?.length).length
        ? (() => {
            const dishes =
              currentDishCollection.find((dc: DishCollectionProps) => dc.language === language)?.dishes || [];
            const visible = expanded ? dishes : dishes.slice(0, 4);
            return (
              <>
                {visible.map((dish: DishProps, index: number) => (
                  <Dish key={`dish-${index}`} type={dish.type} title={dish.title} />
                ))}
                {dishes.length > 4 && (
                  <div css={showMoreContainerStyles}>
                    <button type='button' css={showMoreButtonStyles} onClick={() => setExpanded((v) => !v)}>
                      {expanded ? 'Show less' : `Show more (${dishes.length - 4})`}
                    </button>
                  </div>
                )}
              </>
            );
          })()
        : !loading && <div css={unableToScrapeStyles}>Closed or ¯\_(ツ)_/¯</div>}
      <div css={restaurantLinksStyles}>
        <a href={currentUrl} css={restaurantWebsiteIconStyles}>
          <ExternalLinkIcon css={restaurantLinksIconStyles} />
          Website
        </a>
        <a href={currentGoogleMapsUrl} css={restaurantDirectionStyles}>
          <DirectionIcon css={restaurantLinksIconStyles} />
          Directions
        </a>
      </div>
    </div>
  );
}
