import { Coordinate } from '@devolunch/shared';

const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;

const EARTH_RADIUS_KM = 6371;

export const calculateDistance = (
  { lat: lat1, lon: lon1 }: Coordinate,
  { lat: lat2, lon: lon2 }: Coordinate,
): number => {
  const latitudeDiffRad = degreesToRadians(lat2 - lat1);
  const longitudeDiffRad = degreesToRadians(lon2 - lon1);
  const latitude1Rad = degreesToRadians(lat1);
  const latitude2Rad = degreesToRadians(lat2);

  const havA =
    Math.sin(latitudeDiffRad / 2) * Math.sin(latitudeDiffRad / 2) +
    Math.sin(longitudeDiffRad / 2) * Math.sin(longitudeDiffRad / 2) * Math.cos(latitude1Rad) * Math.cos(latitude2Rad);
  const havC = 2 * Math.atan2(Math.sqrt(havA), Math.sqrt(1 - havA));

  const distance = EARTH_RADIUS_KM * havC;
  return distance;
};
