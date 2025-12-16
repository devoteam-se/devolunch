/**
 * Content cleaner utility to strip unnecessary HTML content and reduce token usage
 * for AI menu extraction while preserving the essential menu information.
 */

export interface CleanedPageContent {
  text: string;
  html: string;
  title: string;
  url: string;
  images?: string[];
}

/**
 * Extracts and cleans page content in the browser context
 * Removes unnecessary elements like scripts, styles, ads, etc.
 * while preserving menu-relevant content.
 */
export const extractCleanContent = (): CleanedPageContent => {
  // Only remove truly non-content elements - keep all visible content
  const elementsToRemove = [
    'script',
    'style',
    'noscript',
    'link[rel="stylesheet"]',
    'meta:not([name="description"]):not([name="keywords"]):not([property])',
  ];

  // Clone the document to avoid modifying the original
  const cleanDoc = document.cloneNode(true) as Document;

  // Remove unwanted elements
  elementsToRemove.forEach((selector) => {
    try {
      const elements = cleanDoc.querySelectorAll(selector);
      elements.forEach((el) => el.remove());
    } catch (_e) {
      // Ignore selector errors
    }
  });

  // Strip attributes from all elements while keeping structure
  const stripAttributes = (element: Element) => {
    // Keep only essential attributes that might be needed for content understanding
    const keepAttributes = ['href', 'src', 'alt', 'title'];

    const attributes = Array.from(element.attributes);
    attributes.forEach((attr) => {
      if (!keepAttributes.includes(attr.name)) {
        element.removeAttribute(attr.name);
      }
    });

    // Recursively process child elements
    Array.from(element.children).forEach((child) => {
      stripAttributes(child);
    });
  };

  // Strip attributes from the entire document
  if (cleanDoc.documentElement) {
    stripAttributes(cleanDoc.documentElement);
  }

  // Use full body content and stripped HTML
  const body = cleanDoc.body;
  const fullContent = body ? body.textContent?.trim() || '' : '';
  const strippedHtml = cleanDoc.documentElement ? cleanDoc.documentElement.innerHTML : '';

  // Extract menu-relevant images
  const menuImages: string[] = [];
  const images = document.querySelectorAll('img[src], img[data-src]');

  images.forEach((img) => {
    const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
    const alt = img.getAttribute('alt') || '';
    const className = img.getAttribute('class') || '';
    const parentText = img.closest('section, div, article')?.textContent?.toLowerCase() || '';

    const rect = img.getBoundingClientRect();
    if (rect.width < 100 || rect.height < 75) return; // Skip tiny images

    const menuKeywords = ['menu', 'meny', 'lunch', 'mat', 'food', 'dagens', 'vecka', 'dish', 'rätt'];
    const isMenuRelated = menuKeywords.some(
      (keyword) =>
        alt.toLowerCase().includes(keyword) ||
        className.toLowerCase().includes(keyword) ||
        parentText.includes(keyword) ||
        src.toLowerCase().includes(keyword),
    );

    if (src && (isMenuRelated || menuImages.length < 2)) {
      // Limit to 2 images max
      const absoluteSrc = src.startsWith('http') ? src : new URL(src, window.location.href).href;
      menuImages.push(absoluteSrc);
    }
  });

  return {
    text: fullContent.slice(0, 50000), // Significantly increased for Sankt Knut
    html: strippedHtml.slice(0, 60000), // Increased HTML limit as well
    title: document.title,
    url: window.location.href,
    images: menuImages.length > 0 ? menuImages : undefined,
  };
};

/**
 * Token estimation utility
 */
export const estimateTokenCount = (text: string): number => {
  // Rough estimation: ~4 characters per token for typical text
  return Math.ceil(text.length / 4);
};

/**
 * Content optimization metrics
 */
export const getOptimizationMetrics = (originalHtml: string, cleanedContent: CleanedPageContent) => {
  const originalTokens = estimateTokenCount(originalHtml);
  const cleanedTokens = estimateTokenCount(cleanedContent.text + cleanedContent.html);
  const tokenSavings = originalTokens - cleanedTokens;
  const percentSaved = Math.round((tokenSavings / originalTokens) * 100);

  return {
    originalTokens,
    cleanedTokens,
    tokenSavings,
    percentSaved,
  };
};
