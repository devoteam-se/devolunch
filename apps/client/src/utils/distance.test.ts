import { describe, expect, test } from 'vitest';
import { calculateDistance } from './distance';
import { Coordinate } from '@devolunch/shared';

describe('distance', () => {
  test('calculateDistance', () => {
    const cord1: Coordinate = {
      lat: 55.61279420267554,
      lon: 13.003281708136813,
    };
    const cord2: Coordinate = {
      lat: 55.60905672891427,
      lon: 12.999891765203932,
    };
    expect(calculateDistance(cord1, cord2)).toEqual(0.4669482750079073);
  });
});
