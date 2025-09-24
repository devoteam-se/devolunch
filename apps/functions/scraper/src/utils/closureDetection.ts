import { ClosureInfo } from '@devolunch/shared';
import { logger } from '@devolunch/shared/logger/node';

/**
 * Known restaurant closure patterns
 */
const KNOWN_CLOSURES: Record<string, string[]> = {
  'marie antoinette': ['monday', 'tuesday'],
  'marvin': ['monday', 'tuesday'],
  // Add more restaurants as needed
};

/**
 * Day names for calculation
 */
const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Detects closure information for a restaurant based on current day and known patterns
 */
export function detectClosureInfo(restaurantName: string): ClosureInfo | null {
  const normalizedName = restaurantName.toLowerCase();
  const closedDays = KNOWN_CLOSURES[normalizedName];

  if (!closedDays || closedDays.length === 0) {
    return null;
  }

  const today = new Date();
  const currentDay = DAYS[today.getDay()];

  const isClosed = closedDays.includes(currentDay);

  if (!isClosed) {
    return null;
  }

  // Calculate when they reopen
  const reopensOn = calculateReopeningDay(closedDays, today);

  const reason = formatClosureReason(closedDays);

  logger.info({
    restaurant: restaurantName,
    currentDay,
    closedDays,
    isClosed,
    reopensOn
  }, 'Detected restaurant closure');

  return {
    isClosed: true,
    reason,
    reopensOn,
    closedDays
  };
}

/**
 * Formats closure reason for display
 */
function formatClosureReason(closedDays: string[]): string {
  if (closedDays.length === 1) {
    return `Closed on ${closedDays[0].charAt(0).toUpperCase() + closedDays[0].slice(1)}s`;
  }

  if (closedDays.length === 2) {
    const [first, second] = closedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1) + 's');
    return `Closed ${first} and ${second}`;
  }

  const formatted = closedDays.map(day => day.charAt(0).toUpperCase() + day.slice(1) + 's');
  const lastDay = formatted.pop();
  return `Closed ${formatted.join(', ')} and ${lastDay}`;
}

/**
 * Calculates the next day the restaurant will be open
 */
function calculateReopeningDay(closedDays: string[], currentDate: Date): string {
  const closedDayIndices = closedDays.map(day => DAYS.indexOf(day));

  // Start checking from tomorrow
  let checkDate = new Date(currentDate);
  checkDate.setDate(checkDate.getDate() + 1);

  // Check up to 7 days ahead
  for (let i = 0; i < 7; i++) {
    const dayIndex = checkDate.getDay();

    if (!closedDayIndices.includes(dayIndex)) {
      if (i === 0) {
        return 'tomorrow';
      } else if (i === 1) {
        return 'the day after tomorrow';
      } else {
        return WEEKDAYS[dayIndex];
      }
    }

    checkDate.setDate(checkDate.getDate() + 1);
  }

  return 'next week';
}

/**
 * Adds closure detection to scraped restaurant data
 */
export function addClosureInfoToLunchMetadata(
  restaurantName: string,
  lunchMetadata: any
): any {
  const closureInfo = detectClosureInfo(restaurantName);

  if (!closureInfo) {
    return lunchMetadata;
  }

  return {
    ...lunchMetadata,
    closureInfo
  };
}
