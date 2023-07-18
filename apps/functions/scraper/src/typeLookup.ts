import { DishType } from '@devolunch/shared';
import keywords from './data/keywords.js';

export interface OptionProps {
  unknownMealDefault: DishType;
}

export default (text: string, options: OptionProps = { unknownMealDefault: 'misc' }): DishType => {
  const find = (arr: string[], lookup: string) =>
    arr.some((keyword: string) => {
      // remove full sentences containing 'lägg till' since it's usually
      // used in the end of a sentence to say something like 'lägg till kött, 10kr'
      const singleLineLookup = lookup
        .replace(/\n/g, ' ')
        .toLowerCase()
        .split('.')
        .filter((sentence) => !sentence.includes('lägg till'))
        .join('.');

      const matchFound = singleLineLookup.includes(keyword);

      if (matchFound) {
        const keywordPosition = singleLineLookup.indexOf(keyword);

        // we remove the full word before the keyword, for example
        // if the match is 'fläsk' and the lookup contains 'sidfläsk',
        // we want to find 'utan' before the full word, not just before 'fläsk'
        const lineBeforeKeyword = singleLineLookup.substring(0, keywordPosition);
        const searchString = lineBeforeKeyword.substring(0, lineBeforeKeyword.lastIndexOf(' '));

        const lastWord = searchString
          .split(' ')
          .filter((a) => a.length)
          .pop();

        // don't match in case what we are looking for is prefixed with "utan" (without)
        if (lastWord === 'utan') {
          return false;
        }
      }
      return matchFound;
    });

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
