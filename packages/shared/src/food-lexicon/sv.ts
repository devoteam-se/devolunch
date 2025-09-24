// What: Swedish food synonym list and helper
// Why: Support query expansion for Swedish inputs (e.g., "köttbullar")

export const SV_SYNONYMS: Record<string, string[]> = {
  'köttbulle': ['köttbullar', 'meatballs', 'swedish meatballs'],
  'köttbullar': ['köttbulle', 'meatballs', 'swedish meatballs', 'järpe', 'järpar', 'wallenbergare', 'pannbiff', 'biff lindström'],
  'wallenbergare': ['köttbullar', 'järpe', 'järpar', 'pannbiff', 'meatballs'],
  'järpe': ['järpar', 'köttbullar', 'wallenbergare', 'pannbiff'],
  'järpar': ['järpe', 'köttbullar', 'wallenbergare', 'pannbiff'],
  'pannbiff': ['köttbullar', 'järpar', 'wallenbergare'],
  'biff lindström': ['köttbullar', 'pannbiff', 'meatballs'],
  'meatballs': ['köttbullar', 'swedish meatballs'],
};

