import { css } from '@emotion/react';

import Dish from '@/components/Dish';

import { ReactComponent as LocationIcon } from '@/assets/location.svg';
import { ReactComponent as ExternalLinkIcon } from '@/assets/external-link.svg';
import { ReactComponent as DirectionIcon } from '@/assets/direction.svg';
import { useRestaurants } from '@/contexts/restaurants';

const restaurantStyles = css`
  display: flex;
  flex-direction: column;
  padding: 0;

  a {
    text-decoration: none;
  }
`;

const restaurantTitleStyles = css`
  color: #000;
  font-family: 'Azeret Mono', monospace;
  font-weight: 500;
  font-size: 1.5rem;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #000;
`;

const restaurantDistanceStyles = css`
  display: flex;
  align-items: center;
  color: #000;
  font-size: 0.875rem;
  margin: 0.75rem 0;
`;

const restaurantLocationIconStyles = css`
  margin-right: 0.25rem;
  width: 1rem;
  height: 1rem;
`;

const restaurantImageStyles = css`
  width: 100%;
  height: 224px;
  border-radius: 10px;
  margin: 0 auto;
  object-fit: cover;
`;

const restaurantLinksStyles = css`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;

  & > a {
    display: flex;
    align-items: center;
    font-size: 1rem;
    background-color: #fff;
    border: 1px solid #000;
    border-radius: 1rem;
    color: #000;
    padding: 0.375rem 0.5rem;
    margin-left: 0.5rem;
  }

  & > a:hover {
    background-color: #ffaa5b;
  }
`;

const restaurantWebsiteIconStyles = css``;

const restaurantLinksIconStyles = css`
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem;
  margin-right: 0.25rem;
`;

const restaurantDirectionStyles = css``;

export default function Restaurant({ title, distance, url, imgUrl, dishCollection, googleMapsUrl }: App.Restaurant) {
  const { language } = useRestaurants();

  return (
    <div css={restaurantStyles}>
      <a href={url}>
        <h2 css={restaurantTitleStyles}>{title}</h2>
        <div css={restaurantDistanceStyles}>
          <LocationIcon css={restaurantLocationIconStyles} />
          {distance?.toFixed(2)} km
        </div>
        <img src={imgUrl} css={restaurantImageStyles} alt={title} />
      </a>
      {dishCollection
        .find((dc) => dc.language === language)
        ?.dishes.map((dish, index) => (
          <Dish key={`dish-${index}`} type={dish.type} description={dish.description} />
        ))}
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
