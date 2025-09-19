// =============================================================================
// COMMON UTILITY FUNCTIONS
// =============================================================================

/**
 * Safely gets URL search parameter
 */
export const getUrlParam = (param: string): string | null => {
  try {
    return new URLSearchParams(window.location.search).get(param);
  } catch {
    return null;
  }
};

/**
 * Sets URL parameter without page reload
 */
export const setUrlParam = (param: string, value: string): void => {
  try {
    const url = new URL(window.location.toString());
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Silently fail if URL manipulation fails
  }
};

/**
 * Formats distance with appropriate units
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * Truncates text to a maximum length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Simple retry mechanism for async functions
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay);
    }
    throw error;
  }
};

/**
 * Check if value is defined and not null
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

/**
 * Safe array access that returns undefined instead of throwing
 */
export const safeArrayAccess = <T>(array: T[], index: number): T | undefined => {
  return array && array.length > index && index >= 0 ? array[index] : undefined;
};