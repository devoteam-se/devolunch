import { Page } from 'puppeteer';
import pdf from 'pdf-parse';
import * as pdfjsLib from 'pdfjs-dist';
import { DishProps, RestaurantMetaProps } from '@devolunch/shared';
import { extractMenuWithAI, PageContent } from '../services/aiMenuExtractor.js';
import { restaurantMetas } from './restaurantMeta.js';
import { extractCleanContent, getOptimizationMetrics, CleanedPageContent } from '../utils/contentCleaner.js';
import { config } from '../index.js';

// Configure your AI-driven sources by environment variable AI_GENERIC_SOURCES (JSON array)
// Example:
// [
//   {
//     "title": "Hyllie Bistro (AI)",
//     "url": "https://www.hylliebryggeri.se/meny",
//     "imageUrl": "https://example.com/image.jpg",
//     "googleMapsUrl": "https://maps.google.com/...",
//     "coordinate": { "lat": 55.61, "lon": 13.00 },
//     "unknownMealDefault": "veg"
//   }
// ]

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

// Optional: hardcode a list here instead of using env
const manualMetas: RestaurantMetaProps[] = [];

// Prefer manual list, then env-provided list; otherwise auto-discover metas from other restaurant modules
export const metas: RestaurantMetaProps[] = manualMetas.length
  ? manualMetas
  : parseSources().length
  ? parseSources()
  : restaurantMetas;

// For image-based PDFs, we'll return a message indicating manual review is needed
const processPdfWithVisionAPI = async (pdfUrl: string, _restaurantMeta: RestaurantMetaProps): Promise<string> => {
  try {
    console.log(`🖼️ Processing image-based PDF: ${pdfUrl}`);
    console.log(
      `⚠️ Image-based PDF detected. Vision API processing requires manual implementation for Cloud Functions.`,
    );

    // Return empty result for now - this would need to be implemented with a proper
    // PDF-to-image conversion service that works in Cloud Functions
    console.log(
      `ℹ️ Skipping image-based PDF extraction. This PDF likely contains menu images that need OCR processing.`,
    );
    console.log(
      `ℹ️ To implement: Add pdf2pic or similar Cloud Functions-compatible library, or use external OCR service.`,
    );

    return '';
  } catch (error) {
    console.error(`❌ PDF processing failed:`, error);
    return '';
  }
};

// Helper function to extract text from PDF using PDF.js text content
const extractPdfWithAdvancedMethod = async (buffer: Buffer): Promise<string> => {
  try {
    console.log(`🔍 Using PDF.js text content extraction for image-based PDF`);

    // Load PDF with PDF.js
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdfDocument = await loadingTask.promise;

    console.log(`📄 PDF has ${pdfDocument.numPages} pages`);

    let extractedText = '';

    // Try to extract text content from each page
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

    return extractedText;
  } catch (error) {
    console.error(`❌ PDF.js advanced extraction failed:`, error);
    return '';
  }
};

// Helper function to extract PDF content with OCR fallback
const extractPdfContent = async (pdfUrl: string, _restaurantMeta?: RestaurantMetaProps): Promise<string> => {
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
        console.log(`📄 Content preview:`, meaningfulText.substring(0, 200));
        return pdfData.text;
      } else {
        console.log(`📄 PDF text extraction insufficient (${meaningfulText.length} chars), trying OCR`);
      }
    } catch (pdfParseError) {
      console.log(`📄 Standard PDF parsing failed, trying OCR:`, pdfParseError);
    }

    // Fallback to advanced PDF.js extraction for image-based PDFs
    const pdfTextFallback = await extractPdfWithAdvancedMethod(pdfBuffer);
    if (pdfTextFallback.trim().length > 50) {
      return pdfTextFallback;
    }

    // If PDF.js also fails, signal that we need Vision API processing
    console.log(`📄 Text extraction failed, will need Vision API processing for image-based PDF`);
    return `PDF_VISION_PROCESSING: ${pdfUrl}`;
  } catch (error) {
    console.error(`❌ Failed to extract PDF content:`, error);
    return '';
  }
};

export const browserScrapeFunction = async (page: Page, meta?: RestaurantMetaProps): Promise<DishProps[]> => {
  const activeMeta = meta as RestaurantMetaProps;
  console.log(`🤖 AI-powered scraping for ${activeMeta?.title ?? 'Unknown'}`);

  try {
    // Wait for content to load
    await page.waitForTimeout(1500);

    // Inject the content cleaner function into the page context
    await page.addScriptTag({
      content: `(${extractCleanContent.toString()})`,
    });

    // 1) Extract page content (with optional optimization)
    const useContentCleaner = activeMeta.useContentCleaner ?? config.useContentCleaner;
    console.log(`🧾 Attempt 1: Extract from page content${useContentCleaner ? ' (optimized)' : ' (full)'}`);

    let htmlOnlyContent: PageContent;

    if (useContentCleaner) {
      const cleanedContent: CleanedPageContent = await page.evaluate(extractCleanContent);

      // Log optimization metrics
      const originalHtml = await page.evaluate(() => document.documentElement.innerHTML);
      const metrics = getOptimizationMetrics(originalHtml, cleanedContent);
      console.log(
        `🚀 Content optimization: ${metrics.percentSaved}% tokens saved (${metrics.originalTokens} → ${metrics.cleanedTokens})`,
      );

      htmlOnlyContent = {
        html: cleanedContent.html,
        text: cleanedContent.text,
        title: cleanedContent.title,
        url: cleanedContent.url,
      };
    } else {
      // Use original full content extraction
      htmlOnlyContent = await page.evaluate(() => ({
        html: document.documentElement.innerHTML,
        text: document.body.innerText,
        title: document.title,
        url: window.location.href,
      }));
    }

    let result = await extractMenuWithAI(htmlOnlyContent, activeMeta, activeMeta.locationFilter);
    if (result.dishes.length > 0) {
      console.log(`✅ Text-first extraction succeeded with ${result.dishes.length} dishes`);
      return result.dishes;
    }

    // 1b) Retry text after extended wait for slow-loading menus
    console.log(`⏳ No dishes yet; waiting for dynamic content (7s) and re-trying text`);
    try {
      // Gentle scroll to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          const distance = 400;
          let scrolled = 0;
          const maxScroll = Math.min(document.body.scrollHeight, 4000);
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            scrolled += distance;
            if (scrolled >= maxScroll) {
              clearInterval(timer);
              window.scrollTo({ top: 0 });
              resolve();
            }
          }, 150);
        });
      });
    } catch (e) {
      console.log(`ℹ️  Scroll attempt skipped/failed`, e);
    }
    await page.waitForTimeout(7000);

    let htmlRetryContent: PageContent;

    if (useContentCleaner) {
      const cleanedRetryContent: CleanedPageContent = await page.evaluate(extractCleanContent);
      htmlRetryContent = {
        html: cleanedRetryContent.html,
        text: cleanedRetryContent.text,
        title: cleanedRetryContent.title,
        url: cleanedRetryContent.url,
      };
    } else {
      htmlRetryContent = await page.evaluate(() => ({
        html: document.documentElement.innerHTML,
        text: document.body.innerText,
        title: document.title,
        url: window.location.href,
      }));
    }
    result = await extractMenuWithAI(htmlRetryContent, activeMeta, activeMeta.locationFilter);
    if (result.dishes.length > 0) {
      console.log(`✅ Text retry after wait succeeded with ${result.dishes.length} dishes`);
      return result.dishes;
    }

    // 2) If no dishes, look for a PDF and try that
    console.log(`🧾 Attempt 2: Searching for PDF link`);
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
      console.log(`📄 Found PDF menu link: ${pdfUrl}`);
      const pdfText = await extractPdfContent(pdfUrl, activeMeta);

      // Check if we need to use Vision API for image-based PDF
      if (pdfText.startsWith('PDF_VISION_PROCESSING:')) {
        const actualPdfUrl = pdfText.split(': ')[1];
        console.log(`🖼️ Using Vision API for image-based PDF: ${actualPdfUrl}`);

        // Process the PDF with Vision API by converting to images
        const visionResult = await processPdfWithVisionAPI(actualPdfUrl, activeMeta);
        if (visionResult) {
          // Parse the result back into dishes format
          const dishes = visionResult
            .split('\n')
            .map((line) => {
              const match = line.match(/^(.+) \((\w+)\)$/);
              if (match) {
                return { title: match[1], type: match[2] as any };
              }
              return null;
            })
            .filter(Boolean);

          if (dishes.length > 0) {
            console.log(`✅ PDF Vision API extraction succeeded with ${dishes.length} dishes`);
            return dishes as any[];
          }
        }
      } else {
        // Regular text-based PDF processing
        const pdfContent: PageContent = {
          html: `<div>PDF Menu Content</div>`,
          text: pdfText || 'Failed to extract PDF content',
          title: `${activeMeta?.title} - PDF Menu`,
          url: pdfUrl,
        };
        result = await extractMenuWithAI(pdfContent, activeMeta, activeMeta.locationFilter);
        if (result.dishes.length > 0) {
          console.log(`✅ PDF text extraction succeeded with ${result.dishes.length} dishes`);
          return result.dishes;
        }
      }
    } else {
      console.log(`ℹ️  No PDF link detected`);
    }

    // 3) Finally, try with images (Vision)
    console.log(`🖼️ Attempt 3: Extract from content with images${useContentCleaner ? ' (optimized)' : ' (full)'}`);

    let withImagesContent: PageContent;

    if (useContentCleaner) {
      const cleanedWithImages: CleanedPageContent = await page.evaluate(extractCleanContent);
      withImagesContent = {
        html: cleanedWithImages.html,
        text: cleanedWithImages.text,
        title: cleanedWithImages.title,
        url: cleanedWithImages.url,
        images: cleanedWithImages.images,
      };
    } else {
      withImagesContent = await page.evaluate(() => {
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

        return {
          html: document.documentElement.innerHTML,
          text: document.body.innerText,
          title: document.title,
          url: window.location.href,
          images: menuImages.length > 0 ? menuImages : undefined,
        };
      });
    }

    result = await extractMenuWithAI(withImagesContent, activeMeta, activeMeta.locationFilter);
    if (result.dishes.length > 0) {
      console.log(`✅ Image-based extraction succeeded with ${result.dishes.length} dishes`);
      return result.dishes;
    }

    console.log(`❌ No dishes extracted after text, PDF, and image attempts`);
    return [];
  } catch (error) {
    console.error(`❌ AI scraping failed for ${activeMeta?.title}:`, error);
    return [];
  }
};
