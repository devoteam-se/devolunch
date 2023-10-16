import { getFullWeekdayName, daysBetween, getDaysRangeFromMenuString, getDishType } from './slagthuset';

describe('getFullWeekdayName', () => {
  it('should return the full weekday name', () => {
    expect(getFullWeekdayName('mån')).toBe('måndag');
    expect(getFullWeekdayName('ons')).toBe('onsdag');
  });
});

describe('daysBetween', () => {
  it('should return days between given days', () => {
    expect(daysBetween('måndag', 'onsdag')).toEqual(['måndag', 'tisdag', 'onsdag']);
  });

  it('should return all days for a full week range', () => {
    expect(daysBetween('måndag', 'fredag')).toEqual(['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag']);
  });

  it('should throw error for invalid days', () => {
    expect(() => daysBetween('fredag', 'onsdag')).toThrow('Invalid days range');
  });
});

describe('getDaysRangeFromMenuString', () => {
  it('should extract the days range from menu string', () => {
    expect(getDaysRangeFromMenuString('Måndag-Onsdag: Some dish')).toEqual(['måndag', 'tisdag', 'onsdag']);
  });
});

describe('getDishType', () => {
  const days = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag'];

  days.forEach((day) => {
    it(`should return the correct dish type for ${day}`, async () => {
      // Meat dishes
      const meatRow = `${day}: Some dish`;
      expect(await getDishType(meatRow, day, null)).toBe('meat');

      // Fish dishes
      const fishRow = `${day}: Some fish dish`;
      expect(await getDishType(fishRow, day, 'Fisk')).toBe('fish');

      // Vegetarian dishes
      const vegRow = `${day}: Some veg dish`;
      expect(await getDishType(vegRow, day, 'Vegetariskt')).toBe('veg');
    });
  });

  it('should return the correct dish type for a range of days', async () => {
    expect(await getDishType('Måndag-Onsdag: Some fish dish', 'tisdag', 'Fisk')).toBe('fish');
    expect(await getDishType('Torsdag-Fredag: Some veg dish', 'torsdag', 'Vegetariskt')).toBe('veg');
  });
});
