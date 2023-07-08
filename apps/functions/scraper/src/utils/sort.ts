import { DishProps } from '@devolunch/shared';

export const compareDish = (a: DishProps, b: DishProps): number => {
  const order: { [key: string]: number } = { veg: 1, fish: 2, meat: 3, misc: 4 };
  return order[a.type] - order[b.type];
};
