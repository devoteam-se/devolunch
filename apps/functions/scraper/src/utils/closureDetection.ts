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
export function detectClosureInfo(restaurantName: string, pageContent?: string): ClosureInfo | null {
  // First check for dynamic closure/booking patterns in page content
  if (pageContent) {
    const dynamicClosure = detectDynamicClosure(pageContent);
    if (dynamicClosure) {
      logger.info({
        restaurant: restaurantName,
        reason: dynamicClosure.reason
      }, 'Detected dynamic closure/booking');
      return dynamicClosure;
    }
  }

  // Fall back to known closure patterns
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
 * Detects dynamic closure patterns like "ABONNERAT" (booked/private event)
 */
function detectDynamicClosure(pageContent: string): ClosureInfo | null {
  const today = new Date();
  const todaySv = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'][today.getDay()];

  // Check for "ABONNERAT" or similar booking patterns
  const bookingPatterns = [
    /abonnerat/i,
    /privat\s+event/i,
    /stängt\s+för\s+privat/i,
    /fully\s+booked/i,
    /helt\s+bokad/i,
  ];

  const hasBookingText = bookingPatterns.some(pattern => pattern.test(pageContent));

  if (!hasBookingText) {
    return null;
  }

  // Check if today is affected
  const lines = pageContent.toLowerCase().split('\n');
  const todayAffected = lines.some(line => {
    const lineContainsTodaySv = line.includes(todaySv);
    const lineContainsBooking = bookingPatterns.some(pattern => pattern.test(line));
    return lineContainsTodaySv && lineContainsBooking;
  });

  // Also check for "hela veckan" (whole week) patterns
  const wholeWeekPattern = /hela\s+veckan|entire\s+week|whole\s+week/i;
  const isWholeWeekBooked = wholeWeekPattern.test(pageContent) && hasBookingText;

  if (todayAffected || isWholeWeekBooked) {
    return {
      isClosed: true,
      reason: 'Private event (Abonnerat)',
      reopensOn: 'Check website for availability',
      closedDays: [] // Dynamic, not regular closure pattern
    };
  }

  return null;
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
  lunchMetadata: any,
  pageContent?: string
): any {
  const closureInfo = detectClosureInfo(restaurantName, pageContent);

  if (!closureInfo) {
    return lunchMetadata;
  }

  return {
    ...lunchMetadata,
    closureInfo
  };
}
