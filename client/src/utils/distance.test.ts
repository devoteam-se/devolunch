import { describe, expect, test } from 'vitest';
import { distance } from './distance';

describe('distance', () => {
  test('calculateDIstance', () => {
    const lat1 = 55.61279420267554;
    const lat2 = 55.60905672891427;
    const lon1 = 13.003281708136813;
    const lon2 = 12.999891765203932;
    expect(distance(lat1, lat2, lon1, lon2)).toEqual(0.46694827500805414);
  });
});
