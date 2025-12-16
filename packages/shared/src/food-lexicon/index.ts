// What: Query expansion helper combining language-specific synonym maps
// Why: Central place to enrich user queries for better matching

import { EN_SYNONYMS } from './en';
import { SV_SYNONYMS } from './sv';

const norm = (s: string) => s.toLowerCase().normalize('NFKD');

const LEXICONS: Record<string, Record<string, string[]>> = {
  en: EN_SYNONYMS,
  sv: SV_SYNONYMS,
};

export function expandQuery(query: string, language: string = 'sv'): { tokens: string[]; primary: string } {
  const q = norm(query.trim());
  const lex = LEXICONS[language] || LEXICONS['sv'];
  const expansions = new Set<string>([q]);

  // direct mappings
  if (lex[q]) {
    lex[q].forEach((alt) => expansions.add(norm(alt)));
  }

  // Also check if any key includes the primary (basic fuzzy)
  Object.keys(lex).forEach((key) => {
    const nk = norm(key);
    if (nk.includes(q) || q.includes(nk)) {
      lex[key].forEach((alt) => expansions.add(norm(alt)));
      expansions.add(nk);
    }
  });

  return { tokens: Array.from(expansions), primary: q };
}

