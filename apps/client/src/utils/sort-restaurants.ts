import { Coordinate, RestaurantProps } from '@devolunch/shared';
import { calculateDistance } from '@/utils/distance';

const DEVOTEAM_LOCATION: Coordinate = {
  lat: 55.61282608776878,
  lon: 13.003325575170862,
};

export const sortRestaurants = (
  restaurants: RestaurantProps[],
  coordinate: Coordinate = DEVOTEAM_LOCATION,
): RestaurantProps[] =>
  restaurants
    .map((r: RestaurantProps) => ({
      ...r,
      distance: calculateDistance(coordinate, r.coordinate),
    }))
    .sort(
      (a: RestaurantProps, b: RestaurantProps) =>
        (b.dishCollection?.filter((d) => d.dishes?.length).length || 0) -
          (a.dishCollection?.filter((d) => d.dishes?.length).length || 0) ||
        (a.distance && b.distance ? a.distance - b.distance : 0),
    );
