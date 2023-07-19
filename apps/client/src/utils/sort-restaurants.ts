import { RestaurantProps } from '@devolunch/shared';
import { calculateDistance } from '@/utils/distance';

const DEVOTEAM_MALMO_LATITUDE = 55.61282608776878;
const DEVOTEAM_MALMO_LONGITUDE = 13.003325575170862;

export const sortRestaurants = (
  restaurants: RestaurantProps[],
  latitude = DEVOTEAM_MALMO_LATITUDE,
  longitude = DEVOTEAM_MALMO_LONGITUDE,
): RestaurantProps[] =>
  restaurants
    .map((r: RestaurantProps) => ({
      ...r,
      distance: calculateDistance(latitude, r.latitude, longitude, r.longitude),
    }))
    .sort(
      (a: RestaurantProps, b: RestaurantProps) =>
        (b.dishCollection?.filter((d) => d.dishes?.length).length || 0) -
          (a.dishCollection?.filter((d) => d.dishes?.length).length || 0) || a.distance - b.distance,
    );
