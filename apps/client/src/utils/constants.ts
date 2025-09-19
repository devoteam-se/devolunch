import { Coordinate } from '@devolunch/shared';

// =============================================================================
// LOCATION CONSTANTS
// =============================================================================

// Devoteam office location in Malmö - used as fallback when user location is unavailable
export const DEVOTEAM_LOCATION: Coordinate = {
  lat: 55.6107258,
  lon: 12.999409,
};

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API_CONFIG = {
  PROD_ROOT: '/api/v1',
  DEV_ROOT: 'http://localhost:8080/api/v1',
  ENDPOINTS: {
    RESTAURANTS: '/restaurants',
  },
} as const;

// =============================================================================
// APPLICATION CONSTANTS
// =============================================================================

export const APP_CONFIG = {
  DEFAULT_LANGUAGE: 'sv',
  REFRESH_INTERVAL_MS: 3600000, // 1 hour
  VISIBLE_DISHES_COLLAPSED: 4,
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI_CONSTANTS = {
  LOADING_SKELETON_COUNT: 8,
  MAX_RESTAURANT_TITLE_LENGTH: 50,
} as const;

// =============================================================================
// ENVIRONMENT HELPERS
// =============================================================================

export const ENVIRONMENT = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  get apiRoot() {
    return this.isDev ? API_CONFIG.DEV_ROOT : API_CONFIG.PROD_ROOT;
  },
} as const;