import type { Page } from 'puppeteer';
import type { RestaurantMetaProps } from '@devolunch/shared';
import { logger } from '@devolunch/shared/logger/node';

import { config } from '../config.js';
import { extractCleanContent, getOptimizationMetrics, CleanedPageContent } from '../utils/contentCleaner.js';
import { handleInteractiveMenus } from './interactive.js';
import type { PageContent } from '../types/index.js';

const TIMEOUT = 120000;

/**
 * Builds PageContent for a given URL with optional content cleaning
 */
export const buildPageContent = async (
  page: Page,
  meta: RestaurantMetaProps,
  url: string,
): Promise<PageContent> => {
  // Use a common desktop UA to avoid basic bot blocks and ensure PDF viewers behave
  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    );
    await page.setExtraHTTPHeaders({ Referer: url });
  } catch {
    logger.warn({ title: meta.title }, 'Error setting user agent or headers');
  }

  await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT });
  await new Promise((resolve) => globalThis.setTimeout(resolve, 1500));

  // Handle interactive menus (day tabs, etc.)
  await handleInteractiveMenus(page, meta);

  await page.addScriptTag({ content: `(${extractCleanContent.toString()})` });

  let content: PageContent;
  // Use content cleaner by default, allow restaurant-specific override
  const useContentCleaner = meta.useContentCleaner ?? config.useContentCleaner;

  if (useContentCleaner) {
    const originalHtml = await page.content();
    const cleanedContent: CleanedPageContent = await page.evaluate(extractCleanContent);
    const metrics = getOptimizationMetrics(originalHtml, cleanedContent);
    logger.info(
      { percentSaved: metrics.percentSaved, original: metrics.originalTokens, cleaned: metrics.cleanedTokens },
      'Content optimization metrics',
    );
    content = {
      html: cleanedContent.html,
      text: cleanedContent.text,
      title: cleanedContent.title,
      url,
      images: cleanedContent.images,
    };
  } else {
    const html = await page.content();
    const title = await page.title();
    const text = await page.evaluate(() => document.body?.innerText || '');

    // Extract images for Vision API processing (similar to old ai-generic.ts)
    const images = await page.evaluate(() => {
      const menuImages: string[] = [];
      const images = document.querySelectorAll('img[src], img[data-src]');

      images.forEach((img) => {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
        const alt = img.getAttribute('alt') || '';
        const className = img.getAttribute('class') || '';
        const parentText = img.closest('section, div, article')?.textContent?.toLowerCase() || '';

        const rect = img.getBoundingClientRect();
        if (rect.width < 200 || rect.height < 150) return;

        const menuKeywords = ['menu', 'meny', 'lunch', 'mat', 'food', 'dagens', 'vecka'];
        const isMenuRelated = menuKeywords.some(
          (keyword) =>
            alt.toLowerCase().includes(keyword) ||
            className.toLowerCase().includes(keyword) ||
            parentText.includes(keyword) ||
            src.toLowerCase().includes(keyword),
        );

        if (src && (isMenuRelated || menuImages.length < 3)) {
          const absoluteSrc = src.startsWith('http') ? src : new URL(src, window.location.href).href;
          menuImages.push(absoluteSrc);
        }
      });

      return menuImages.length > 0 ? menuImages : undefined;
    });

    content = { html, text, title, url, images };
  }

  return content;
};