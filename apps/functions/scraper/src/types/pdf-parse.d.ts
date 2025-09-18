declare module 'pdf-parse/lib/pdf-parse.js' {
  const pdf: (data: Buffer | Uint8Array, options?: any) => Promise<any>;
  export default pdf;
}

