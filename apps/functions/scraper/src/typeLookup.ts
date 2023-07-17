import { DishType } from '@devolunch/shared';
import keywords from './data/keywords.js';

export interface OptionProps {
  unknownMealDefault: DishType;
}

export default (text: string, options: OptionProps = { unknownMealDefault: 'misc' }): DishType => {
  const find = (arr: string[], lookup: string) =>
    arr.some((keyword: string) => lookup.replace(/\n/g, ' ').toLowerCase().includes(keyword));

  if (find(keywords.meats, text)) {
    return 'meat';
  }
  if (find(keywords.fishes, text)) {
    return 'fish';
  }
  if (find(keywords.vegan, text)) {
    return 'vegan';
  }
  if (find(keywords.vegetarian, text)) {
    return 'veg';
  }

  return options.unknownMealDefault;
};
