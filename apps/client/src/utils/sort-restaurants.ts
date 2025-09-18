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
    .map((r: RestaurantProps) => {
      // For multi-location restaurants, find the closest location
      let closestDistance = calculateDistance(coordinate, r.coordinate);

      if (r.locations && r.locations.length > 0) {
        const distances = r.locations.map((loc) => calculateDistance(coordinate, loc.coordinate));
        closestDistance = Math.min(...distances);
      }

      return {
        ...r,
        distance: closestDistance,
      };
    })
    .sort(
      (a: RestaurantProps, b: RestaurantProps) =>
        (b.dishCollection?.filter((d) => d.dishes?.length).length || 0) -
          (a.dishCollection?.filter((d) => d.dishes?.length).length || 0) ||
        (a.distance && b.distance ? a.distance - b.distance : 0),
    );
