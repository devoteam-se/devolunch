import { css, keyframes } from '@emotion/react';
import Footer from './Footer';
import Header from './Header';
import Main from './Main';
import { RestaurantProps } from '@devolunch/shared';
import { color } from '@/utils/theme';

const spinnerKeyFrame = keyframes`
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
`;

const loaderContainerStyles = css`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  background: rgba(0, 0, 0, 0.125);
  z-index: 1;
`;

const spinnerStyles = css`
  width: 64px;
  height: 64px;
  border: 8px solid;
  border-color: ${color.devoteam} transparent ${color.devoteam} transparent;
  border-radius: 50%;
  animation: ${spinnerKeyFrame} 1.2s linear infinite;
`;

const mockedRestaurant: RestaurantProps = {
  title: '',
  url: '',
  googleMapsUrl: '',
  imageUrl: '',
  coordinate: { lat: 0, lon: 0 },
  dishCollection: [],
  distance: 0,
};

const mockedRestaurants: RestaurantProps[] = [
  mockedRestaurant,
  mockedRestaurant,
  mockedRestaurant,
  mockedRestaurant,
  mockedRestaurant,
  mockedRestaurant,
  mockedRestaurant,
  mockedRestaurant,
  mockedRestaurant,
];

export default function LoadingSkeleton() {
  return (
    <>
      <div css={loaderContainerStyles}>
        <div css={spinnerStyles}></div>
      </div>
      <Header scrapeDate={null} />
      <Main restaurants={mockedRestaurants} />;
      <Footer />
    </>
  );
}
