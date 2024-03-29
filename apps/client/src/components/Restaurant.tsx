import { css } from '@emotion/react';

import Dish from '@/components/Dish';

import { ReactComponent as LocationIcon } from '@/assets/location.svg';
import { ReactComponent as ExternalLinkIcon } from '@/assets/external-link.svg';
import { ReactComponent as DirectionIcon } from '@/assets/direction.svg';
import { useRestaurants } from '@/contexts/restaurants';
import { color } from '@/utils/theme';

import { RestaurantProps, DishCollectionProps, DishProps } from '@devolunch/shared';
import { useProgressiveImg } from '@/hooks/progressive-image';

const restaurantStyles = css`
  display: flex;
  flex-direction: column;
  padding: 0;
`;

const restaurantTitleStyles = css`
  white-space: pre-wrap;
  color: ${color.black};
  font-family: 'Azeret Mono', monospace;
  font-weight: 500;
  font-size: 1.25rem;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${color.black};
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

export default function Restaurant({
  title,
  imageUrl,
  imageUrlLowQuality,
  distance,
  url,
  dishCollection,
  googleMapsUrl,
}: RestaurantProps) {
  const { loading, language } = useRestaurants();
  const { src, blur } = useProgressiveImg(imageUrlLowQuality, imageUrl);

  const distanceText = loading
    ? ' '
    : distance && distance < 1
    ? `${(distance * 1000)?.toFixed(0)} m`
    : `${distance?.toFixed(2)} km`;

  return (
    <div css={restaurantStyles}>
      <h2 css={restaurantTitleStyles}>{loading ? ' ' : title}</h2>
      <div css={restaurantDistanceStyles}>
        <LocationIcon css={restaurantLocationIconStyles} />
        {!loading && distanceText}
      </div>
      <a href={url} css={restaurantImageLinkStyles}>
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
      {dishCollection && dishCollection.filter((a: DishCollectionProps) => a.dishes?.length).length
        ? dishCollection
            .find((dc: DishCollectionProps) => dc.language === language)
            ?.dishes.map((dish: DishProps, index: number) => (
              <Dish key={`dish-${index}`} type={dish.type} title={dish.title} />
            ))
        : !loading && <div css={unableToScrapeStyles}>Closed or ¯\_(ツ)_/¯</div>}
      <div css={restaurantLinksStyles}>
        <a href={url} css={restaurantWebsiteIconStyles}>
          <ExternalLinkIcon css={restaurantLinksIconStyles} />
          Website
        </a>
        <a href={googleMapsUrl} css={restaurantDirectionStyles}>
          <DirectionIcon css={restaurantLinksIconStyles} />
          Directions
        </a>
      </div>
    </div>
  );
}
