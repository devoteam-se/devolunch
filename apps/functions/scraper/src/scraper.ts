import puppeteer, { Browser, Page } from 'puppeteer';
import { Storage } from '@google-cloud/storage';
import * as ff from '@google-cloud/functions-framework';
// Import the core pdf-parse function directly to avoid debug code that reads test fixtures
import pdf from 'pdf-parse/lib/pdf-parse.js';

import { config } from './config.js';
import { translateRestaurants } from './utils/translator.js';
import { compareDish } from './utils/sort.js';
import { extractMenuWithAI, PageContent } from './services/aiMenuExtractor.js';
import { restaurants } from './restaurants.js';
import { extractCleanContent, getOptimizationMetrics, CleanedPageContent } from './utils/contentCleaner.js';
import { DishProps, RestaurantMetaProps, RestaurantProps, Scrape } from '@devolunch/shared';
import { logger } from '@devolunch/shared/logger/node';

export const BUCKET_NAME = 'devolunchv2';
const TIMEOUT = 120000;

export const storage = new Storage({
  projectId: 'devolunch',
});

// Clean PDF text extraction to fix common OCR errors
const cleanPdfText = (text: string): string => {
  return text
    // Fix common PDF ligature/encoding issues
    .replace(/0läsk/g, 'fläsk')  // "0läsk" -> "fläsk" (pork)
    .replace(/con0iterad/g, 'confiterad')  // "con0iterad" -> "confiterad" (confit)
    .replace(/0isk/g, 'fisk')  // "0isk" -> "fisk" (fish)
    .replace(/kyckling0/g, 'kycklingfilé')  // Common truncation
    // Fix other common OCR substitutions
    .replace(/([a-zåäö])0([a-zåäö])/g, '$1fi$2')  // Generic "0" -> "fi" in middle of words
    .replace(/\b0([a-zåäö])/g, 'fi$1')  // "0" at word start -> "fi"
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
};

// Helper function to extract PDF content with robust error handling
const extractPdfContent = async (pdfUrl: string): Promise<string> => {
  try {
    logger.info({ pdfUrl }, 'Fetching PDF content');
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    logger.info(
      { status: response.status, contentType: response.headers.get('content-type') || undefined },
      'PDF response metadata',
    );

    const buffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);
    logger.debug({ size: pdfBuffer.byteLength }, 'PDF buffer size');

    // Try standard PDF text extraction first
    try {
      const pdfData = await pdf(pdfBuffer);
      logger.debug({ length: pdfData.text.length }, 'PDF text extraction length');

      // Check if we got meaningful text (more than just whitespace/minimal chars)
      const meaningfulText = pdfData.text.trim().replace(/\s+/g, ' ');
      if (meaningfulText.length > 50) {
        logger.info('Using standard PDF text extraction');
        return cleanPdfText(pdfData.text);
      } else {
        logger.info({ length: meaningfulText.length }, 'PDF text insufficient; trying pdfjs-dist');
      }
    } catch (pdfParseError) {
      logger.warn({ err: pdfParseError }, 'Standard PDF parsing failed; trying pdfjs-dist');
    }

    // Fallback to pdfjs-dist for image-based PDFs
    try {
      logger.info('Using PDF.js text content extraction for image-based PDF');

      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
      const pdfDocument = await loadingTask.promise;

      logger.info({ pages: pdfDocument.numPages }, 'PDF page count');

      let extractedText = '';
      const pagesToProcess = Math.min(pdfDocument.numPages, 3);

      for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
        logger.debug({ pageNum, pagesToProcess }, 'Processing PDF page with PDF.js');

        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine all text items
        const pageText = textContent.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        extractedText += pageText + '\n';
      }

      logger.debug({ length: extractedText.length }, 'PDF.js extracted characters');
      logger.debug({ preview: extractedText.substring(0, 200) }, 'PDF.js content preview');

      if (extractedText.trim().length > 50) {
        return cleanPdfText(extractedText);
      }
    } catch (pdfjsError) {
      logger.error({ err: pdfjsError }, 'PDF.js extraction failed');
    }

    logger.info('Text extraction failed; Vision API may be needed');
    return '';
  } catch (error) {
    logger.error({ err: error }, 'Failed to extract PDF content');
    return '';
  }
};

// Parse restaurant sources from environment or use defaults
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

// Get restaurant metadata - prefer env sources, fallback to hardcoded list
const getRestaurantMetas = (): RestaurantMetaProps[] => {
  const envSources = parseSources();
  return envSources.length ? envSources : restaurants;
};

// Enhanced interactive menu handling for day-specific content
const handleInteractiveMenus = async (page: Page, meta: RestaurantMetaProps): Promise<void> => {
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
              const searchText = selector.match(/\("([^"]+)"\)/)?.[1];
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

// Build PageContent for a given URL (with optional cleaning)
const buildPageContent = async (
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

// Try to extract dishes from PageContent and optionally fall back to PDFs, supporting location filters
const extractDishesWithFallback = async (
  page: Page,
  content: PageContent,
  meta: RestaurantMetaProps,
  locationFilter?: string,
  otherLocationFilters?: string[],
): Promise<DishProps[]> => {
  const minConfidence = 0.5;

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

  // STEP 1: Try text extraction (without images first)
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
    return textResult.dishes;
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
        if (href.match(/v\.?\s*\d{1,2}/i) || href.match(/week\s*\d{1,2}/i) || href.match(/vecka\s*\d{1,2}/i)) {
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
        return pdfResult.dishes;
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
    const imageOnlyContent: PageContent = {
      html: '',
      text: '',
      title: content.title,
      url: content.url,
      images: content.images,
    };

    const imageResult = await extractMenuWithAI(imageOnlyContent, meta, locationFilter);
    if (imageResult.dishes.length > 0) {
      logger.info({ count: imageResult.dishes.length }, 'Step 3 SUCCESS: dishes from images');
      return imageResult.dishes;
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
  const useContentCleaner = meta.useContentCleaner ?? config.useContentCleaner;
  let retryContent: PageContent;

  if (useContentCleaner) {
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
    return retryResult.dishes;
  } else {
    logger.info('Step 4: Still no dishes after waiting for dynamic content');
  }

  logger.warn({ locationFilter }, 'All 4 extraction attempts failed');
  return [];
};

// Scrape a single page URL with optional location filter
const scrapeFromUrl = async (
  page: Page,
  meta: RestaurantMetaProps,
  url: string,
  locationFilter?: string,
): Promise<DishProps[]> => {
  try {
    const content = await buildPageContent(page, meta, url);
    return await extractDishesWithFallback(page, content, meta, locationFilter);
  } catch (error) {
    logger.error({ title: meta.title, locationFilter, err: error }, 'Error scraping');
    return [];
  }
};

// Process multiple restaurants and build restaurant data
const processRestaurants = async (browser: Browser, metas: RestaurantMetaProps[]): Promise<RestaurantProps[]> => {
  const restaurants: RestaurantProps[] = [];
  const MAX_CONCURRENT = 5;

  // Process restaurants in batches
  for (let i = 0; i < metas.length; i += MAX_CONCURRENT) {
    const batch = metas.slice(i, i + MAX_CONCURRENT);

    const batchPromises = batch.map(async (meta) => {
      const page = await browser.newPage();
      try {
        // Multi-location handling
        if (meta.multiLocation) {
          const { type, locations } = meta.multiLocation;

          if (type === 'shared') {
            // Scrape once and share across locations
            const dishes = await scrapeFromUrl(page, meta, meta.url);
            const sorted = dishes?.sort(compareDish) || [];
            const locs = locations.map((loc) => ({
              ...loc,
              dishCollection: [
                {
                  language: config.defaultLanguage,
                  dishes: sorted,
                },
              ],
            }));

            const restaurant: RestaurantProps = {
              title: meta.title,
              url: meta.url,
              imageUrl: meta.imageUrl,
              coordinate: meta.coordinate,
              googleMapsUrl: meta.googleMapsUrl,
              locations: locs,
            };
            return restaurant;
          }

          if (type === 'filtered') {
            // Build content once, then extract per location with regex-based narrowing
            // Run sequentially to avoid concurrent PDF fallbacks on the same page
            const content = await buildPageContent(page, meta, meta.url);
            const locs = [] as RestaurantProps['locations'];
            for (let idx = 0; idx < locations.length; idx++) {
              const loc = locations[idx]!;
              const otherFilters = locations
                .filter((_, i) => i !== idx)
                .map((l) => l.locationFilter)
                .filter((s): s is string => Boolean(s));
              const dishes = await extractDishesWithFallback(
                page,
                content,
                meta,
                loc.locationFilter,
                otherFilters,
              );
              locs!.push({
                ...loc,
                dishCollection: [
                  {
                    language: config.defaultLanguage,
                    dishes: dishes?.sort(compareDish) || [],
                  },
                ],
              });
            }

            const restaurant: RestaurantProps = {
              title: meta.title,
              url: meta.url,
              imageUrl: meta.imageUrl,
              coordinate: meta.coordinate,
              googleMapsUrl: meta.googleMapsUrl,
              locations: locs,
            };
            return restaurant;
          }

          if (type === 'separate') {
            // Launch an independent Puppeteer browser per location (in parallel)
            const locs = await Promise.all(
              locations.map(async (loc) => {
                const url = loc.url || meta.url;
                const browser2 = await puppeteer.launch({
                  args: !config.development ? ['--disable-gpu'] : [],
                  headless: true,
                });
                const p2 = await browser2.newPage();
                try {
                  const dishes = await scrapeFromUrl(p2, meta, url, loc.locationFilter);
                  return {
                    ...loc,
                    dishCollection: [
                      {
                        language: config.defaultLanguage,
                        dishes: dishes?.sort(compareDish) || [],
                      },
                    ],
                  };
                } finally {
                  await p2.close();
                  await browser2.close();
                }
              }),
            );

            const restaurant: RestaurantProps = {
              title: meta.title,
              url: meta.url,
              imageUrl: meta.imageUrl,
              coordinate: meta.coordinate,
              googleMapsUrl: meta.googleMapsUrl,
              locations: locs,
            };
            return restaurant;
          }
        }

        // Single-location (default)
        const dishes = await scrapeFromUrl(page, meta, meta.url);

        // Check if restaurant is closed
        const isClosed = dishes.some(
          (dish) => dish.title?.toLowerCase().includes('stängt') || dish.title?.toLowerCase().includes('closed'),
        );

        const restaurant: RestaurantProps = {
          title: meta.title,
          url: meta.url,
          imageUrl: meta.imageUrl,
          coordinate: meta.coordinate,
          googleMapsUrl: meta.googleMapsUrl,
          dishCollection: [
            {
              language: config.defaultLanguage,
              dishes: isClosed ? [] : dishes?.sort(compareDish) || [],
            },
          ],
        };
        return restaurant;
      } catch (error) {
        logger.error({ title: meta.title, err: error }, 'Error processing restaurant');
        return null;
      } finally {
        await page.close();
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const validRestaurants = batchResults.filter((r): r is RestaurantProps => r !== null);
    restaurants.push(...validRestaurants);

    logger.info(
      {
        batch: Math.ceil((i + 1) / MAX_CONCURRENT),
        totalBatches: Math.ceil(metas.length / MAX_CONCURRENT),
        processed: validRestaurants.length,
      },
      'Processed restaurant batch',
    );
  }

  return restaurants;
};

// Main scraping logic - can be called directly or via HTTP
export const runScraping = async (): Promise<Scrape> => {
  logger.info('Starting AI-powered restaurant scraping');

  const browser = await puppeteer.launch({
    args: !config.development ? ['--disable-gpu'] : [],
    headless: true,
  });

  try {
    // Get restaurant metadata
    const metas = getRestaurantMetas();
    logger.info({ count: metas.length }, 'Found restaurants to scrape');

    // Process all restaurants
    const restaurants = await processRestaurants(browser, metas);
    logger.info({ count: restaurants.length }, 'Completed scraping');

    await browser.close();

    // Prepare final scrape result
    const scrape: Scrape = {
      date: new Date(),
      restaurants: await translateRestaurants(restaurants),
    };

    // Development mode: save to local file
    if (config.development) {
      const fs = await import('fs/promises');
      const path = await import('path');

      const localFilePath = path.join(process.cwd(), 'scrape.json');
      await fs.writeFile(localFilePath, JSON.stringify(scrape, null, 2));
      logger.info({ count: scrape.restaurants.length, path: localFilePath }, 'Saved restaurants to local file');
    } else {
      // Production: upload to storage
      if (!scrape?.restaurants?.length) {
        throw new Error('No restaurants scraped successfully');
      }

      const bucket = storage.bucket(BUCKET_NAME);
      await bucket.file('scrape.json').save(JSON.stringify(scrape));
      logger.info({ count: scrape.restaurants.length }, 'Uploaded restaurants to cloud storage');
    }

    return scrape;
  } catch (error) {
    logger.error({ err: error }, 'Scraping failed');
    await browser.close();
    throw error;
  }
};

// Cloud Function HTTP handler
ff.http('scrape', async (_req: ff.Request, res: ff.Response) => {
  void _req;
  try {
    const scrape = await runScraping();
    res.json(scrape);
  } catch (error) {
    logger.error({ err: error }, 'Scraping failed');
    res.sendStatus(500);
  }
});

// Direct execution when run as script
if (import.meta.url === `file://${process.argv[1]}`) {
  runScraping()
    .then(() => {
      logger.info('Scraping completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ err: error }, 'Direct scraping failed');
      process.exit(1);
    });
}
