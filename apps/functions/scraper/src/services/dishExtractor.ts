import type { Page } from 'puppeteer';
import type { RestaurantMetaProps } from '@devolunch/shared';
import { logger } from '@devolunch/shared/logger/node';

import { config } from '../config.js';
import { extractMenuWithAI } from './aiMenuExtractor.js';
import { extractPdfContent } from '../processors/pdf.js';
import { extractCleanContent } from '../utils/contentCleaner.js';
import type { PageContent, MenuExtractionResult } from '../types/index.js';

/**
 * Attempts to extract dishes with multiple fallback strategies:
 * 1. Text extraction from HTML
 * 2. PDF extraction (if PDF links found)
 * 3. Image extraction (Vision API)
 * 4. Delayed text extraction (for slow-loading content)
 */
export const extractDishesWithFallback = async (
  page: Page,
  content: PageContent,
  meta: RestaurantMetaProps,
  locationFilter?: string,
  otherLocationFilters?: string[],
): Promise<MenuExtractionResult> => {
  const minConfidence = 0.5;

  // Special handling for Sankt Knut which has heavy JavaScript and needs content cleaning
  const isStanktKnut = locationFilter === 'Sankt Knut';
  const useContentCleanerOverride = isStanktKnut ? true : (meta.useContentCleaner ?? config.useContentCleaner);

  // Helper: compile regex from a filter string (supports alternations already)
  const compile = (pat: string) => new RegExp(pat, 'i');
  const targetRe = locationFilter ? compile(locationFilter) : null;
  const othersRe = otherLocationFilters?.length
    ? new RegExp(otherLocationFilters.map((p) => `(${p})`).join('|'), 'i')
    : null;

  const narrowTextByLocation = (text: string): string => {
    if (!targetRe) return text;
    const lines = text.split('\n');
    const segments: string[] = [];
    let i = 0;
    while (i < lines.length) {
      if (targetRe.test(lines[i])) {
        // capture from a bit above to include heading
        let start = Math.max(0, i - 2);
        let j = i + 1;
        while (j < lines.length) {
          if (othersRe && othersRe.test(lines[j])) break;
          j++;
        }
        segments.push(lines.slice(start, j).join('\n'));
        i = j;
      } else {
        i++;
      }
    }
    if (segments.length === 0) return text; // fallback
    return segments.join('\n\n');
  };

  // STEP 1: Try text extraction (with special handling for Sankt Knut)
  if (isStanktKnut) {
    logger.info('Sankt Knut detected: Using content cleaning for initial attempt');
    // Wait for dynamic content to load
    await new Promise((resolve) => globalThis.setTimeout(resolve, 10000));

    // Use content cleaning for Sankt Knut (text only, no images)
    const cleanedContent = await page.evaluate(extractCleanContent);
    const sankKnutContent: PageContent = {
      html: cleanedContent.html,
      // Don't narrow by location since we're already on the Sankt Knut-specific page
      text: cleanedContent.text,
      title: cleanedContent.title,
      url: cleanedContent.url,
      images: undefined, // No images for Spoonery - text extraction only
    };

    const sankKnutResult = await extractMenuWithAI(sankKnutContent, meta, locationFilter);
    if (sankKnutResult.dishes.length > 0) {
      logger.info({ count: sankKnutResult.dishes.length }, 'Sankt Knut SUCCESS: dishes extracted with content cleaning');
      return sankKnutResult;
    }
  }

  logger.info('Attempt 1: Text extraction from HTML');
  const textOnlyContent: PageContent = {
    ...content,
    text: locationFilter ? narrowTextByLocation(content.text) : content.text,
    images: undefined, // No images for text-only attempt
  };

  const textResult = await extractMenuWithAI(textOnlyContent, meta, locationFilter);
  const acceptText = textResult.dishes.length > 0 && (config.development || textResult.confidence >= minConfidence);
  if (acceptText) {
    logger.info(
      {
        count: textResult.dishes.length,
        confidence: textResult.confidence,
        minConfidence,
        dev: !!config.development,
        locationFilter,
      },
      'Step 1 SUCCESS: dishes from text',
    );
    return textResult;
  } else if (textResult.dishes.length > 0) {
    logger.info(
      { confidence: textResult.confidence, minConfidence, locationFilter },
      'Step 1 low confidence; trying PDF',
    );
  } else {
    logger.info('Step 1: No dishes found in text content');
  }

  // STEP 2: Try PDF extraction
  logger.info('Attempt 2: PDF link detection and processing');
  const pdfUrl = await page.evaluate(() => {
    const lunchKeywords = ['lunch', 'lunchmeny', 'dagens lunch', 'veckans lunch', 'weekly menu', 'week'];
    const generalMenuKeywords = ['meny', 'menu'];
    const links = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];

    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const link of links) {
      const href = link.getAttribute('href');
      const text = link.innerText?.toLowerCase() || '';
      const title = link.getAttribute('title')?.toLowerCase() || '';
      const ariaLabel = link.getAttribute('aria-label')?.toLowerCase() || '';
      const allText = `${text} ${title} ${ariaLabel}`;

      if (href && href.toLowerCase().includes('.pdf')) {
        // Score based on how lunch-specific the link is
        let score = 0;

        for (const keyword of lunchKeywords) {
          if (allText.includes(keyword) || href.toLowerCase().includes(keyword)) {
            score += keyword === 'lunch' || keyword === 'lunchmeny' ? 10 : 5;
          }
        }

        // Also check for week/date patterns that suggest current menus
        if (href.match(/v\\.?\\s*\\d{1,2}/i) || href.match(/week\\s*\\d{1,2}/i) || href.match(/vecka\\s*\\d{1,2}/i)) {
          score += 3;
        }

        if (score > bestScore) {
          bestMatch = href.startsWith('http') ? href : new URL(href, window.location.href).href;
          bestScore = score;
        } else if (score === 0) {
          // Fallback to general menu PDFs
          for (const keyword of generalMenuKeywords) {
            if (allText.includes(keyword) || href.toLowerCase().includes(keyword)) {
              if (!bestMatch && bestScore === 0) {
                bestMatch = href.startsWith('http') ? href : new URL(href, window.location.href).href;
              }
              break;
            }
          }
        }
      }
    }

    console.log(`PDF search found: ${bestMatch} (score: ${bestScore})`);
    return bestMatch;
  });

  if (pdfUrl) {
    logger.info({ pdfUrl }, 'Found PDF menu');
    const pdfText = await extractPdfContent(pdfUrl);

    if (pdfText && pdfText.trim().length > 50) {
      const narrowedPdfText = locationFilter ? narrowTextByLocation(pdfText) : pdfText;
      const pdfContent: PageContent = {
        html: `<div>PDF Menu Content</div>`,
        text: narrowedPdfText,
        title: `${meta.title} - PDF Menu`,
        url: pdfUrl,
      };

      const pdfResult = await extractMenuWithAI(pdfContent, meta, locationFilter);
      if (pdfResult.dishes.length > 0) {
        logger.info({ count: pdfResult.dishes.length }, 'Step 2 SUCCESS: dishes from PDF');
        return pdfResult;
      } else {
        logger.info({ confidence: pdfResult.confidence }, 'Step 2: PDF found but no dishes extracted');
      }
    } else {
      logger.info('Step 2: PDF text extraction failed or insufficient content');
    }
  } else {
    logger.info('Step 2: No PDF links detected');
  }

  // STEP 3: Try image extraction (Vision API)
  if (content.images && content.images.length > 0) {
    logger.info('Attempt 3: Image extraction with Vision API');
    const imageWithTextContent: PageContent = {
      html: content.html,
      text: locationFilter ? narrowTextByLocation(content.text) : content.text,
      title: content.title,
      url: content.url,
      images: content.images,
    };

    const imageResult = await extractMenuWithAI(imageWithTextContent, meta, locationFilter);
    if (imageResult.dishes.length > 0) {
      logger.info({ count: imageResult.dishes.length }, 'Step 3 SUCCESS: dishes from images');
      return imageResult;
    } else {
      logger.info({ confidence: imageResult.confidence }, 'Step 3: Images found but no dishes extracted');
    }
  } else {
    logger.info('Step 3: No images found for Vision API processing');
  }

  // STEP 4: Wait and retry text extraction for slow-loading content
  logger.info('Attempt 4: Waiting for slow-loading content and retrying text extraction');
  await new Promise((resolve) => globalThis.setTimeout(resolve, 7000)); // Wait 7 seconds for dynamic content

  // Re-extract content after waiting
  let retryContent: PageContent;

  if (useContentCleanerOverride) {
    const cleanedRetryContent = await page.evaluate(extractCleanContent);
    retryContent = {
      html: cleanedRetryContent.html,
      text: cleanedRetryContent.text,
      title: cleanedRetryContent.title,
      url: cleanedRetryContent.url,
      images: cleanedRetryContent.images,
    };
  } else {
    const html = await page.content();
    const title = await page.title();
    const text = await page.evaluate(() => document.body?.innerText || '');
    retryContent = { html, text, title, url: content.url };
  }

  const retryTextContent: PageContent = {
    ...retryContent,
    text: locationFilter ? narrowTextByLocation(retryContent.text) : retryContent.text,
    images: undefined, // Text-only for final attempt
  };

  const retryResult = await extractMenuWithAI(retryTextContent, meta, locationFilter);
  if (retryResult.dishes.length > 0) {
    logger.info({ count: retryResult.dishes.length }, 'Step 4 SUCCESS: dishes from delayed text extraction');
    return retryResult;
  } else {
    logger.info('Step 4: Still no dishes after waiting for dynamic content');
  }

  logger.warn({ locationFilter }, 'All 4 extraction attempts failed');
  return { dishes: [], confidence: 0, reasoning: 'All extraction attempts failed', lunchInfo: undefined };
};