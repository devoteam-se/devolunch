import { useEffect } from 'react';
import { css } from '@emotion/react';
import { color } from '@/utils/theme';
import { formatDistance } from '@/utils/common';
import type { RestaurantProps, DishCollectionProps } from '@devolunch/shared';
import LocationIcon from '@/assets/location.svg?react';
import ExternalLinkIcon from '@/assets/external-link.svg?react';
import DirectionIcon from '@/assets/direction.svg?react';
import ClockIcon from '@/assets/clock.svg?react';
import { useProgressiveImg } from '@/hooks/progressive-image';

const modalOverlay = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const modalContent = css`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  max-height: 85vh;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
`;

const modalHeader = css`
  padding: 1.5rem 1.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const modalCloseButton = css`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background: #f5f5f5;
  }
`;

const modalBody = css`
  padding: 0 1.5rem 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
`;

// Restaurant card styles (matching Restaurant.tsx)
const restaurantCardStyles = css`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
`;

const titleContainerStyles = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${color.black};
  margin-bottom: 0.75rem;
`;

const modalRestaurantTitleStyles = css`
  white-space: pre-wrap;
  color: ${color.black};
  font-family: 'Azeret Mono', monospace;
  font-weight: 500;
  font-size: 1.75rem;
  margin: 0;
  text-align: left;
  line-height: 1.2;
  flex: 1;
`;

const titleMetaStyles = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const distanceInfoStyles = css`
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: ${color.black};
`;

const restaurantLocationIconStyles = css`
  margin-right: 0.25rem;
  width: 1rem;
`;

const openingTimesStyles = css`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: ${color.blackOlive};
`;

const clockIconStyles = css`
  width: 0.875rem;
  height: 0.875rem;
  margin-right: 0.25rem;
  color: ${color.blackOlive};
`;

const restaurantImageStyles = css`
  width: 100%;
  height: 12rem;
  border-radius: 0.625rem;
  object-fit: cover;
`;

const restaurantImageFallback = css`
  width: 100%;
  height: 12rem;
  border-radius: 0.625rem;
  background: #f0f0f0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin: 0 auto 0.75rem;
  font-size: 2rem;
`;

const restaurantLinksStyles = css`
  display: flex;
  justify-content: flex-start;

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
    margin-right: 0.5rem;
    text-decoration: none;
  }

  & > a:hover {
    background-color: ${color.orange};
  }
`;

const restaurantLinksIconStyles = css`
  width: 0.75rem;
  margin-right: 0.375rem;
  fill: ${color.blue};
`;

// Dish styles matching Restaurant card Dish component
const dishStyles = css`
  padding: 0.75rem 0;
  border-bottom: 1px solid ${color.black};
`;

const dishTitleStyles = css`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 0.75rem;
  margin-right: 0.5rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
`;

const dishTitleIconStyles = css`
  width: 1rem;
  height: 1rem;
  margin: 0;
  background-color: ${color.foodType.meat};
  border-radius: 50%;
  border: 1px solid ${color.blackOlive};
  margin-right: 0.5rem;

  &[data-vegan='true'] {
    background-color: ${color.foodType.vegan};
  }

  &[data-veg='true'] {
    background-color: ${color.foodType.veg};
  }

  &[data-fish='true'] {
    background-color: ${color.foodType.fish};
  }

  &[data-misc='true'] {
    background-color: ${color.foodType.misc};
  }
`;

const dishDescriptionStyles = css`
  font-family: 'Open Sans', sans-serif;
  margin: 0;
  color: ${color.black};
  text-align: left;
`;

const noMenuStyles = css`
  padding: 2rem;
  text-align: center;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 0.625rem;
`;

interface MenuModalProps {
  restaurant: RestaurantProps;
  language: string;
  onClose: () => void;
}

export default function MenuModal({ restaurant, language, onClose }: MenuModalProps) {
  const { src, blur } = useProgressiveImg(restaurant.imageUrlLowQuality, restaurant.imageUrl);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const fallbackInitial = restaurant.title ? restaurant.title.charAt(0).toUpperCase() : '?';
  const distanceText = typeof restaurant.distance === 'number' ? formatDistance(restaurant.distance) : '';
  const locationText = restaurant.locations?.[0]?.title || '';

  // Get lunch info for opening times
  const dishCollection = restaurant.dishCollection?.find((dc: DishCollectionProps) => dc.language === language);
  const lunchInfo = dishCollection?.lunchInfo;

  return (
    <div css={modalOverlay} onClick={onClose}>
      <div css={modalContent} onClick={(e) => e.stopPropagation()}>
        <div css={modalHeader}>
          <h2 css={modalRestaurantTitleStyles}>{restaurant.title}</h2>
          <button css={modalCloseButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div css={modalBody}>
          <div css={restaurantCardStyles}>
            <div css={titleContainerStyles}>
              <div css={titleMetaStyles}>
                <div css={distanceInfoStyles}>
                  <LocationIcon css={restaurantLocationIconStyles} />
                  {distanceText}{locationText && ` • ${locationText}`}
                </div>
                {lunchInfo?.servingTimes && (
                  <div css={openingTimesStyles}>
                    <ClockIcon css={clockIconStyles} />
                    {lunchInfo.servingTimes}
                  </div>
                )}
              <div css={restaurantLinksStyles}>
              {restaurant.url && (
                <a href={restaurant.url} target='_blank' rel='noopener noreferrer'>
                  <ExternalLinkIcon css={restaurantLinksIconStyles} />
                  Website
                </a>
              )}
              {restaurant.googleMapsUrl && (
                <a href={restaurant.googleMapsUrl} target='_blank' rel='noopener noreferrer'>
                  <DirectionIcon css={restaurantLinksIconStyles} />
                  Directions
                </a>
              )}
            </div>
              </div>
            </div>



            {restaurant.imageUrl || restaurant.imageUrlLowQuality ? (
              <img
                src={src}
                style={{
                  filter: blur ? 'blur(20px)' : 'none',
                  transition: blur ? 'none' : 'filter 0.3s ease-out',
                }}
                css={restaurantImageStyles}
                alt={restaurant.title}
              />
            ) : (
              <div css={restaurantImageFallback} aria-hidden='true'>
                {fallbackInitial}
              </div>
            )}


            <div>
              {restaurant.dishCollection?.map((collection, idx) =>
                collection.dishes.map((dish, dishIdx) => (
                  <div key={`${idx}-${dishIdx}`} css={dishStyles}>
                    <h3 css={dishTitleStyles}>
                      <div
                        css={dishTitleIconStyles}
                        data-vegan={dish.type === 'vegan'}
                        data-veg={dish.type === 'veg'}
                        data-fish={dish.type === 'fish'}
                        data-misc={dish.type === 'misc'}
                      />
                      {dish.type}
                    </h3>
                    <p css={dishDescriptionStyles}>{dish.title}</p>
                    {dish.description && <p css={dishDescriptionStyles}>{dish.description}</p>}
                  </div>
                ))
              )}
              {!restaurant.dishCollection?.some(dc => dc.dishes.length > 0) && (
                <div css={noMenuStyles}>
                  {language === 'sv' ? 'Ingen meny tillgänglig' : 'No menu available'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
