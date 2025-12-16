import type { Page } from 'puppeteer';
import type { RestaurantMetaProps } from '@devolunch/shared';
import { logger } from '@devolunch/shared/logger/node';

/**
 * Enhanced interactive menu handling for day-specific content
 * Automatically clicks on day tabs/buttons to show current day's menu
 */
export const handleInteractiveMenus = async (page: Page, meta: RestaurantMetaProps): Promise<void> => {
  // Get current day for targeting the right tab
  const currentDay = new Date();
  const dayNames = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
  const dayNamesEn = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDayIndex = currentDay.getDay();
  const currentDayName = dayNames[currentDayIndex];
  const currentDayNameEn = dayNamesEn[currentDayIndex];

  logger.info(
    { sv: currentDayName, en: currentDayNameEn },
    'Looking for interactive day tabs for today',
  );

  try {
    // Look for interactive day tabs/buttons
    const dayTabClicked = await page.evaluate(
      (dayName, dayNameEn) => {
        // Common selectors for day tabs
        const selectors = [
          `button:contains("${dayName}")`,
          `button:contains("${dayNameEn}")`,
          `a:contains("${dayName}")`,
          `a:contains("${dayNameEn}")`,
          `[data-day="${dayName}"]`,
          `[data-day="${dayNameEn}"]`,
          `[data-day="${dayName.charAt(0).toUpperCase() + dayName.slice(1)}"]`,
          `.day-${dayName}`,
          `.day-${dayNameEn}`,
          `#${dayName}`,
          `#${dayNameEn}`,
          `[aria-label*="${dayName}"]`,
          `[aria-label*="${dayNameEn}"]`,
          `[title*="${dayName}"]`,
          `[title*="${dayNameEn}"]`,
        ];

        // Helper function to check if element contains text (case insensitive)
        const containsText = (element: Element, text: string): boolean => {
          return element.textContent?.toLowerCase().includes(text.toLowerCase()) || false;
        };

        // Find and click day-specific elements
        for (const selector of selectors) {
          try {
            if (selector.includes(':contains')) {
              // Handle pseudo-selector manually
              const baseSelector = selector.split(':contains')[0];
              const searchText = selector.match(/\\("([^"]+)"\\)/)?.[1];
              if (searchText) {
                const elements = document.querySelectorAll(baseSelector);
                for (const element of elements) {
                  if (containsText(element, searchText)) {
                    console.log(`📅 Clicking day tab: ${searchText}`);
                    (element as HTMLElement).click();
                    return true;
                  }
                }
              }
            } else {
              const element = document.querySelector(selector);
              if (element) {
                console.log(`📅 Clicking day element: ${selector}`);
                (element as HTMLElement).click();
                return true;
              }
            }
          } catch {
            console.log(`⚠️ Error clicking day element: ${selector}`);
          }
        }

        // Fallback: look for any clickable elements with day names
        const allClickables = document.querySelectorAll('button, a, [onclick], [data-day], .day, .tab');
        for (const element of allClickables) {
          if (containsText(element, dayName) || containsText(element, dayNameEn)) {
            console.log(`📅 Clicking found day element with text: ${element.textContent?.substring(0, 50)}`);
            (element as HTMLElement).click();
            return true;
          }
        }

        return false;
      },
      currentDayName,
      currentDayNameEn,
    );

    if (dayTabClicked) {
      logger.info({ day: currentDayName }, 'Clicked day tab; waiting for content');
      await new Promise((resolve) => globalThis.setTimeout(resolve, 2000)); // Wait for dynamic content

      // Wait for any loading indicators to disappear
      try {
        await page.waitForFunction(() => !document.querySelector('.loading, .spinner, [data-loading="true"]'), {
          timeout: 5000,
        });
      } catch {
        logger.warn({ title: meta.title }, 'Error waiting for loading indicators to disappear');
      }
    } else {
      logger.info({ title: meta.title }, 'No interactive day tabs found');
    }
  } catch (error) {
    logger.warn({ err: error }, 'Error handling interactive menus');
  }
};