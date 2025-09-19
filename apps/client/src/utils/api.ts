import { Scrape } from '@devolunch/shared';
import { API_CONFIG, ENVIRONMENT } from './constants';
import { retry } from './common';

// =============================================================================
// API CONFIGURATION
// =============================================================================

const getApiUrl = (endpoint: string): string => {
  return `${ENVIRONMENT.apiRoot}${endpoint}`;
};

// =============================================================================
// REQUEST DEDUPLICATION
// =============================================================================

// Cache for preventing duplicate API calls
const requestCache = new Map<string, Promise<unknown>>();

const createCachedRequest = <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
  const cached = requestCache.get(key);
  if (cached) {
    return cached as Promise<T>;
  }

  const request = requestFn().finally(() => {
    // Clean up cache after request completes
    requestCache.delete(key);
  });

  requestCache.set(key, request);
  return request;
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Fetches restaurant data with retry logic and caching
 */
export const fetchRestaurants = async (): Promise<Scrape | null> => {
  const cacheKey = 'restaurants';

  return createCachedRequest(cacheKey, async () => {
    try {
      const response = await retry(async () => {
        const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.RESTAURANTS));
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res;
      });

      const data = await response.json();
      return data as Scrape;
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      return null;
    }
  });
};

/**
 * Generic API fetch utility with error handling
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: {
    headers?: Record<string, string>;
    method?: string;
    body?: string;
  } = {}
): Promise<T | null> => {
  try {
    const response = await fetch(getApiUrl(endpoint), {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...(options.method && { method: options.method }),
      ...(options.body && { body: options.body }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    return null;
  }
};

// =============================================================================
// API STATUS UTILITIES
// =============================================================================

/**
 * Checks if the API is available
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(ENVIRONMENT.apiRoot, {
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch {
    return false;
  }
};