import Main from './Main';
import { RestaurantProps } from '@devolunch/shared';

const mockedRestaurant: RestaurantProps = {
  title: '',
  url: '',
  googleMapsUrl: '',
  latitude: 0,
  longitude: 0,
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
  return <Main restaurants={mockedRestaurants} />;
}
