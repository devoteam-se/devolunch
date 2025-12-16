// What: English food synonym list and helper
// Why: Support query expansion (e.g., "meatballs" -> related Swedish dishes)

export const EN_SYNONYMS: Record<string, string[]> = {
  // meatballs and related Swedish dishes
  'meatball': ['meatballs', 'swedish meatballs', 'köttbulle', 'köttbullar', 'wallenbergare', 'järpe', 'järpar', 'pannbiff', 'biff lindström'],
  'meatballs': ['meatball', 'swedish meatballs', 'köttbulle', 'köttbullar', 'wallenbergare', 'järpe', 'järpar', 'pannbiff', 'biff lindström'],
  'swedish meatballs': ['meatball', 'meatballs', 'köttbulle', 'köttbullar'],
  'wallenbergare': ['meatball', 'meatballs', 'köttbullar', 'järpe', 'järpar', 'pannbiff'],
  'järpe': ['meatballs', 'järpar', 'köttbullar', 'wallenbergare', 'pannbiff'],
  'järpar': ['meatballs', 'järpe', 'köttbullar', 'wallenbergare', 'pannbiff'],
  'köttbulle': ['köttbullar', 'meatballs', 'swedish meatballs'],
  'köttbullar': ['köttbulle', 'meatballs', 'swedish meatballs'],
  'pannbiff': ['meatballs', 'köttbullar', 'järpar', 'wallenbergare'],
  'biff lindström': ['meatballs', 'köttbullar', 'pannbiff'],
};

