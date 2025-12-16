import { Coordinate, RestaurantProps } from '@devolunch/shared';
import { calculateDistance } from '@/utils/distance';
import { DEVOTEAM_LOCATION } from '@/utils/constants';

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
        (a.distance && b.distance ? a.distance - b.distance : 0) || a.title.localeCompare(b.title),
    );
