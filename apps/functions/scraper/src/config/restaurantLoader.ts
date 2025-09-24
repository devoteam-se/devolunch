import type { RestaurantMetaProps } from '@devolunch/shared';
import { restaurants } from '../restaurants.js';
import { logger } from '@devolunch/shared/logger/node';

/**
 * Parses restaurant sources from environment variables
 */
const parseSources = (): RestaurantMetaProps[] => {
  try {
    const raw = process.env.AI_GENERIC_SOURCES;
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr as RestaurantMetaProps[];
  } catch {
    return [];
  }
};

/**
 * Parses test override restaurants from environment for debugging
 */
const parseTestOverrideRestaurants = (): string[] => {
  const testOverride = process.env.TEST_OVERRIDE;
  if (!testOverride) return [];
  return testOverride.split(',').map(name => name.trim().toLowerCase());
};

/**
 * Gets restaurant metadata - prefers env sources, falls back to hardcoded list
 * Supports TEST_OVERRIDE filtering for debugging specific restaurants
 */
export const getRestaurantMetas = (): RestaurantMetaProps[] => {
  const envSources = parseSources();
  let metas = envSources.length ? envSources : restaurants;

  // Filter to only include test override restaurants for debugging
  const testOverrideNames = parseTestOverrideRestaurants();
  if (testOverrideNames.length > 0) {
    const originalCount = metas.length;
    metas = metas.filter(meta => testOverrideNames.includes(meta.title.toLowerCase()));
    logger.info({
      testOverrideRestaurants: testOverrideNames,
      originalCount,
      filteredCount: metas.length
    }, 'Using TEST_OVERRIDE to limit restaurants for debugging');
  }

  return metas;
};