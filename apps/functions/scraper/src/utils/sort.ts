import { DishProps } from '@devolunch/shared';

export const compareDish = (a: DishProps, b: DishProps): number => {
  const order: { [key: string]: number } = { vegan: 1, veg: 2, fish: 3, meat: 4, misc: 5 };
  return order[a.type] - order[b.type];
};
