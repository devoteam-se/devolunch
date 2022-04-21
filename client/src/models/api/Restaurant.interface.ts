import { DishI } from './Dish.interface';

export interface RestaurantI {
  title: string;
  description: string;
  imgUrl: string;
  dishes: DishI[];
}
