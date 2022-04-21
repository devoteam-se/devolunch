export enum DishTypes {
  MEAT = 'MEAT',
  FISH = 'FISH',
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
}

export interface DishI {
  type: DishTypes;
  description: string;
  price?: string;
}
