// Import the core pdf-parse function directly to avoid debug code that reads test fixtures
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { logger } from '@devolunch/shared/logger/node';

/**
 * Cleans PDF text extraction to fix common OCR errors
 */
const cleanPdfText = (text: string): string => {
  return text
    // Fix common PDF ligature/encoding issues
    .replace(/([a-zåäö])0([a-zåäö])/g, '$1fi$2')  // Generic "0" -> "fi" in middle of words
    .replace(/\b0([a-zåäö])/g, 'fi$1')  // "0" at word start -> "fi"
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extracts PDF content with robust error handling and fallback methods
 */
export const extractPdfContent = async (pdfUrl: string): Promise<string> => {
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
