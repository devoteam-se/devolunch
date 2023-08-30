import { DishType } from '@devolunch/shared';

import fishes from './keywords/fishes.js';
import meats from './keywords/meats.js';
import vegan from './keywords/vegan.js';
import vegetarian from './keywords/vegetarian.js';

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
    type: 'vegan',
    keywords: vegan,
  },
  {
    type: 'veg',
    keywords: vegetarian,
  },
];
