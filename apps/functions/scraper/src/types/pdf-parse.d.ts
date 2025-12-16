declare module 'pdf-parse/lib/pdf-parse.js' {
  interface PdfParseOptions {
    version?: string;
    max?: number;
    normalizeWhitespace?: boolean;
  }

  interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    text: string;
    version: string;
  }

  const pdf: (data: Buffer | Uint8Array, options?: PdfParseOptions) => Promise<PdfParseResult>;
  export default pdf;
}

