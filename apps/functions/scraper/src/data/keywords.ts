import { DishType } from '@devolunch/shared';

import fishes from './keywords/fishes.js';
import meats from './keywords/meats.js';
import vegetarian from './keywords/vegetarian.js';
import vegan from './keywords/vegan.js';

interface Keyword {
  type: DishType;
  keywords: string[];
}

export const keywordGroups: Keyword[] = [
  {
    type: 'fish',
    keywords: fishes,
  },
  {
    type: 'meat',
    keywords: meats,
  },
  {
    type: 'veg',
    keywords: vegetarian,
  },
  {
    type: 'vegan',
    keywords: vegan,
  },
];
