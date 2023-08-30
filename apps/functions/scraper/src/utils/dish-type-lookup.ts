import { DishProps, DishType } from '@devolunch/shared';

import { keywordGroups } from '../data/keywords.js';

export interface OptionProps {
  unknownDishTypeDefault: DishType;
}

const isKeywordPrefixedWith = (lookupString: string, keyword: string, word: string): boolean => {
  const keywordPosition = lookupString.indexOf(keyword);

  // use a regular expression to find the last word before the keyword
  const lastWordMatch = lookupString.substring(0, keywordPosition).match(/\b\w+\s*$/);
  const lastWord = lastWordMatch ? lastWordMatch[0].trim() : '';

  return lastWord === word;
};

const findKeywordInLookup = (keywords: string[], lookupString: string): boolean => {
  // use a regular expression to split the lookup string into sentences
  const sentences = lookupString.match(/[^.!?]+[.!?]+/g) || [lookupString];

  const sentencesWithoutWord = sentences.filter((sentence) => !sentence.includes('lägg till'));

  return keywords.some((keyword) => {
    const keywordWithoutPrefix = isKeywordPrefixedWith(sentencesWithoutWord.join('.'), keyword, 'utan');
    return sentencesWithoutWord.some((sentence) => sentence.includes(keyword) && !keywordWithoutPrefix);
  });
};

export const determineDishType = (lookupString: string, unknownDishTypeDefault: DishType): DishType => {
  const lowerCaseLookupString = lookupString.toLowerCase();

  for (const { keywords, type } of keywordGroups) {
    if (findKeywordInLookup(keywords, lowerCaseLookupString)) {
      return type;
    }
  }

  return unknownDishTypeDefault;
};

export const updateDishType = (dish: DishProps, { unknownDishTypeDefault = 'misc' }: OptionProps): DishProps => ({
  ...dish,
  type:
    dish.title && !dish.type
      ? determineDishType(`${dish.title} ${dish.description}`, unknownDishTypeDefault)
      : dish.type,
});
