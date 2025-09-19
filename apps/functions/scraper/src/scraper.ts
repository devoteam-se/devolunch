import puppeteer, { Page } from 'puppeteer';
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
    console.log(`📄 Fetching PDF content from: ${pdfUrl}`);
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    console.log(`📄 PDF response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);

    const buffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(buffer);
    console.log(`📄 PDF buffer size: ${pdfBuffer.byteLength} bytes`);

    // Try standard PDF text extraction first
    try {
      const pdfData = await pdf(pdfBuffer);
      console.log(`📄 PDF text extraction: ${pdfData.text.length} characters`);

      // Check if we got meaningful text (more than just whitespace/minimal chars)
      const meaningfulText = pdfData.text.trim().replace(/\s+/g, ' ');
      if (meaningfulText.length > 50) {
        console.log(`📄 Using standard PDF text extraction`);
        return cleanPdfText(pdfData.text);
      } else {
        console.log(`📄 PDF text extraction insufficient (${meaningfulText.length} chars), trying pdfjs-dist`);
      }
    } catch (pdfParseError) {
      console.log(`📄 Standard PDF parsing failed, trying pdfjs-dist:`, pdfParseError);
    }

    // Fallback to pdfjs-dist for image-based PDFs
    try {
      console.log(`🔍 Using PDF.js text content extraction for image-based PDF`);

      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBuffer) });
      const pdfDocument = await loadingTask.promise;

      console.log(`📄 PDF has ${pdfDocument.numPages} pages`);

      let extractedText = '';
      const pagesToProcess = Math.min(pdfDocument.numPages, 3);

      for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
        console.log(`🔍 Processing page ${pageNum}/${pagesToProcess} with PDF.js text extraction`);

        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Combine all text items
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedText += pageText + '\n';
      }

      console.log(`📄 PDF.js extracted ${extractedText.length} characters`);
      console.log(`📄 Content preview:`, extractedText.substring(0, 200));

      if (extractedText.trim().length > 50) {
        return cleanPdfText(extractedText);
      }
    } catch (pdfjsError) {
      console.error(`❌ PDF.js extraction failed:`, pdfjsError);
    }

    console.log(`📄 Text extraction failed, will need Vision API processing for image-based PDF`);
    return '';
  } catch (error) {
    console.error(`❌ Failed to extract PDF content:`, error);
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

  console.log(`🗓️ Today is ${currentDayName}/${currentDayNameEn}, looking for interactive day tabs`);

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
                    (element as any).click();
                    return true;
                  }
                }
              }
            } else {
              const element = document.querySelector(selector);
              if (element) {
                console.log(`📅 Clicking day element: ${selector}`);
                (element as any).click();
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
            (element as any).click();
            return true;
          }
        }

        return false;
      },
      currentDayName,
      currentDayNameEn,
    );

    if (dayTabClicked) {
      console.log(`✅ Clicked on ${currentDayName} tab, waiting for content to load`);
      await page.waitForTimeout(2000); // Wait for dynamic content

      // Wait for any loading indicators to disappear
      try {
        await page.waitForFunction(() => !document.querySelector('.loading, .spinner, [data-loading="true"]'), {
          timeout: 5000,
        });
      } catch {
        console.log(`⚠️ Error waiting for loading indicators to disappear for ${meta.title}`);
      }
    } else {
      console.log(`ℹ️ No interactive day tabs found for ${meta.title}`);
    }
  } catch (error) {
    console.log(`⚠️ Error handling interactive menus: ${error}`);
  }
};

// Build PageContent for a given URL (with optional cleaning) and collect PDF links
const buildPageContent = async (
  page: Page,
  meta: RestaurantMetaProps,
  url: string,
): Promise<{ content: PageContent; pdfLinks: string[] }> => {
  // Use a common desktop UA to avoid basic bot blocks and ensure PDF viewers behave
  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    );
    await page.setExtraHTTPHeaders({ Referer: url });
  } catch {
    console.log(`⚠️ Error setting user agent or headers for ${meta.title}`);
  }

  await page.goto(url, { waitUntil: 'networkidle2', timeout: TIMEOUT });
  await page.waitForTimeout(1500);

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
    console.log(
      `📊 Content optimization: ${metrics.percentSaved}% reduction (${metrics.originalTokens} → ${metrics.cleanedTokens} tokens)`,
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

  // Collect potential PDF links from anchors and embedded elements
  const pdfLinks = await page.evaluate(() => {
    const urls = new Set<string>();
    const add = (u?: string | null) => {
      if (!u) return;
      try {
        const abs = new URL(u, document.baseURI).href;
        urls.add(abs);
      } catch {
        console.log(`⚠️ Error adding URL: ${u}`);
      }
    };

    // Anchors likely pointing to PDFs
    document.querySelectorAll('a[href]')?.forEach((a) => {
      const href = (a as HTMLAnchorElement).getAttribute('href') || '';
      if (/\.pdf(\b|[?#])/i.test(href)) add(href);
    });

    // Link tags explicitly marked as PDFs
    document.querySelectorAll('link[type="application/pdf"][href]')?.forEach((l) => add(l.getAttribute('href')));

    // Embedded PDF viewers
    document.querySelectorAll('embed[src], iframe[src], object[data]')?.forEach((el: Element) => {
      const tag = el.tagName.toLowerCase();
      const type = (el as any).type ? String((el as any).type).toLowerCase() : '';
      if (tag === 'embed' || tag === 'iframe') {
        const src = (el as any).getAttribute('src');
        if (/\.pdf(\b|[?#])/i.test(src || '') || type.includes('pdf')) add(src);
      } else if (tag === 'object') {
        const data = (el as any).getAttribute('data');
        if (/\.pdf(\b|[?#])/i.test(data || '') || type.includes('pdf')) add(data);
      }
    });

    return Array.from(urls);
  });
  return { content, pdfLinks };
};

// Try to extract dishes from PageContent and optionally fall back to PDFs, supporting location filters
const extractDishesWithFallback = async (
  page: Page,
  content: PageContent,
  meta: RestaurantMetaProps,
  pdfLinks: string[],
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
  console.log(`🔍 Attempt 1: Text extraction from HTML`);
  const textOnlyContent: PageContent = {
    ...content,
    text: locationFilter ? narrowTextByLocation(content.text) : content.text,
    images: undefined, // No images for text-only attempt
  };

  const textResult = await extractMenuWithAI(textOnlyContent, meta, locationFilter);
  const acceptText = textResult.dishes.length > 0 && (config.development || textResult.confidence >= minConfidence);
  if (acceptText) {
    console.log(
      `✅ Step 1 SUCCESS: ${textResult.dishes.length} dishes from text (confidence: ${textResult.confidence}, threshold: ${minConfidence}${
        config.development ? ' - dev mode' : ''
      })${locationFilter ? ` [filter: ${locationFilter}]` : ''}`,
    );
    return textResult.dishes;
  } else if (textResult.dishes.length > 0) {
    console.log(
      `ℹ️ Step 1 low confidence: ${textResult.confidence} < ${minConfidence}, trying PDF...${
        locationFilter ? ` [filter: ${locationFilter}]` : ''
      }`,
    );
  } else {
    console.log(`ℹ️ Step 1: No dishes found in text content`);
  }

  // STEP 2: Try PDF extraction
  console.log(`📄 Attempt 2: PDF link detection and processing`);
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
    console.log(`📄 Found PDF menu: ${pdfUrl}`);
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
        console.log(`✅ Step 2 SUCCESS: ${pdfResult.dishes.length} dishes from PDF`);
        return pdfResult.dishes;
      } else {
        console.log(`ℹ️ Step 2: PDF found but no dishes extracted (confidence: ${pdfResult.confidence})`);
      }
    } else {
      console.log(`ℹ️ Step 2: PDF text extraction failed or insufficient content`);
    }
  } else {
    console.log(`ℹ️ Step 2: No PDF links detected`);
  }

  // STEP 3: Try image extraction (Vision API)
  if (content.images && content.images.length > 0) {
    console.log(`🖼️ Attempt 3: Image extraction with Vision API`);
    const imageOnlyContent: PageContent = {
      html: '',
      text: '',
      title: content.title,
      url: content.url,
      images: content.images,
    };

    const imageResult = await extractMenuWithAI(imageOnlyContent, meta, locationFilter);
    if (imageResult.dishes.length > 0) {
      console.log(`✅ Step 3 SUCCESS: ${imageResult.dishes.length} dishes from images`);
      return imageResult.dishes;
    } else {
      console.log(`ℹ️ Step 3: Images found but no dishes extracted (confidence: ${imageResult.confidence})`);
    }
  } else {
    console.log(`ℹ️ Step 3: No images found for Vision API processing`);
  }

  // STEP 4: Wait and retry text extraction for slow-loading content
  console.log(`⏳ Attempt 4: Waiting for slow-loading content and retrying text extraction`);
  await page.waitForTimeout(7000); // Wait 7 seconds for dynamic content

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
    console.log(`✅ Step 4 SUCCESS: ${retryResult.dishes.length} dishes from delayed text extraction`);
    return retryResult.dishes;
  } else {
    console.log(`ℹ️ Step 4: Still no dishes after waiting for dynamic content`);
  }

  console.log(`❌ All 4 extraction attempts failed${locationFilter ? ` for filter ${locationFilter}` : ''}`);
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
    const { content, pdfLinks } = await buildPageContent(page, meta, url);
    return await extractDishesWithFallback(page, content, meta, pdfLinks, locationFilter);
  } catch (error) {
    console.error(`❌ Error scraping ${meta.title}${locationFilter ? ` [${locationFilter}]` : ''}:`, error);
    return [];
  }
};

// Process multiple restaurants and build restaurant data
const processRestaurants = async (browser: any, metas: RestaurantMetaProps[]): Promise<RestaurantProps[]> => {
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
            const { content, pdfLinks } = await buildPageContent(page, meta, meta.url);
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
                pdfLinks,
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
                  headless: 'new',
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
        console.error(`❌ Error processing ${meta.title}:`, error);
        return null;
      } finally {
        await page.close();
      }
    });

    const batchResults = await Promise.all(batchPromises);
    const validRestaurants = batchResults.filter((r): r is RestaurantProps => r !== null);
    restaurants.push(...validRestaurants);

    console.log(
      `Processed batch ${Math.ceil((i + 1) / MAX_CONCURRENT)}/${Math.ceil(metas.length / MAX_CONCURRENT)}: ${
        validRestaurants.length
      } restaurants`,
    );
  }

  return restaurants;
};

// Main scraping logic - can be called directly or via HTTP
export const runScraping = async (): Promise<Scrape> => {
  console.log('🚀 Starting AI-powered restaurant scraping...');

  const browser = await puppeteer.launch({
    args: !config.development ? ['--disable-gpu'] : [],
    headless: 'new',
  });

  try {
    // Get restaurant metadata
    const metas = getRestaurantMetas();
    console.log(`📋 Found ${metas.length} restaurants to scrape`);

    // Process all restaurants
    const restaurants = await processRestaurants(browser, metas);
    console.log(`✅ Completed scraping: ${restaurants.length} restaurants processed`);

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
      console.log(`💾 Saved ${scrape.restaurants.length} restaurants to local file: ${localFilePath}`);
    } else {
      // Production: upload to storage
      if (!scrape?.restaurants?.length) {
        throw new Error('No restaurants scraped successfully');
      }

      const bucket = storage.bucket(BUCKET_NAME);
      await bucket.file('scrape.json').save(JSON.stringify(scrape));
      console.log(`☁️ Uploaded ${scrape.restaurants.length} restaurants to cloud storage`);
    }

    return scrape;
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    await browser.close();
    throw error;
  }
};

// Cloud Function HTTP handler
ff.http('scrape', async (_: ff.Request, res: ff.Response) => {
  try {
    const scrape = await runScraping();
    res.json(scrape);
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    res.sendStatus(500);
  }
});

// Direct execution when run as script
if (import.meta.url === `file://${process.argv[1]}`) {
  runScraping()
    .then(() => {
      console.log('🎉 Scraping completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Direct scraping failed:', error);
      process.exit(1);
    });
}
