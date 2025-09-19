import { useContext } from 'react';
import { RestaurantsContext } from '@/contexts/RestaurantsContext';

export const useRestaurants = () => {
  const context = useContext(RestaurantsContext);
  if (!context) {
    throw new Error('useRestaurants must be used within a RestaurantsProvider');
  }
  return context;
};