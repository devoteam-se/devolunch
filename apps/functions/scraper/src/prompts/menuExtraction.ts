import type { RestaurantMetaProps } from '@devolunch/shared';
import type { PageContent } from '../types/index.js';
import { filterLunchContent } from '../processors/contentFilter.js';

/**
 * Creates comprehensive menu extraction instructions for AI models
 */
export const createMenuExtractionInstructions = (weekdaySv: string, locationFilter?: string): string => {
  // Calculate current Swedish week number (ISO week) to handle odd/even week menus
  const currentDate = new Date();
  // ISO week calculation - Sweden uses ISO 8601 week numbering
  const thursday = new Date(currentDate.getTime() + (3 - ((currentDate.getDay() + 6) % 7)) * 86400000);
  const yearOfThursday = thursday.getFullYear();
  const firstThursday = new Date(yearOfThursday, 0, 4);
  const weekNumber = Math.floor(((thursday.getTime() - firstThursday.getTime()) / 86400000 + 1) / 7) + 1;
  const isOddWeek = weekNumber % 2 === 1;
  const locationInstruction = locationFilter
    ? `LOCATION_FILTER: ${locationFilter}
- CRITICAL: This restaurant has multiple locations. Extract ONLY menu items for the location "${locationFilter}". Look for section headers, location names, or geographical references that match this location.
- If menu items are organized by location sections (e.g., "Gängtappen", "Dockan", "Kvartetten", "Hyllie"), include only items from the "${locationFilter}" section.
- Ignore menu items from other locations or branches.
`
    : '';

  return `${locationInstruction}Extract ALL lunch dishes from LUNCH SECTIONS ONLY.
CRITICAL: Do not stop after finding a few dishes - extract EVERY dish that meets the criteria below.

WHAT TO INCLUDE - MANDATORY EXTRACTION:
• PRIORITY 1: ANY "Veckans" items - ALWAYS extract these weekly specials (remove "Veckans" prefix from title)
• PRIORITY 2: Daily dishes for TODAY (${weekdaySv}) ONLY - NEVER extract dishes from other weekdays
• PRIORITY 3: Vegetarian/vegan options that are available today (labeled "Vegetarisk", "Vegan", etc.)
• PRIORITY 4: "Always available" items (labeled "Alltid", "Always", "Permanent menu", etc.) with lunch pricing
• PRIORITY 5: Items with lunch pricing (100-200kr) that are not weekday-specific
• PRIORITY 6: For restaurants with permanent menus (like bowl restaurants, pizza places, etc.): ALL main dishes/bowls/entrees that appear to be full meals, even without explicit pricing or lunch labeling
• CRITICAL: ONLY extract dishes that ACTUALLY APPEAR on the menu - DO NOT add common lunch items if they are not explicitly listed

CRITICAL WEEKDAY FILTERING RULES:
• TODAY IS ${weekdaySv.toUpperCase()} - extract dishes labeled for ${weekdaySv}
• MULTI-DAY RANGES: If dishes are labeled for date ranges that include today (e.g., "Måndag-Onsdag", "Monday-Wednesday"), EXTRACT THEM
• SINGLE DAY EXCLUSION: NEVER extract dishes from other single weekdays: ${['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag'].filter(day => day !== weekdaySv.toLowerCase()).join(', ')}
• If you see "Måndag: [dish]" and today is tisdag, DO NOT extract that dish
• EXCEPTION FOR PERMANENT MENUS: If the restaurant appears to have a permanent menu (like bowl restaurants, pizza places, sushi places) with no weekday labeling, extract ALL menu items regardless of weekday rules
• If you see weekday schedules, extract from the ${weekdaySv} section AND any range that includes ${weekdaySv}
• EXCEPTION: Always extract "Vegetarisk/Vegetarian", "Vegan", "Alltid/Always" items even if not weekday-specific
• Weekly specials ("Veckans") are available every day - always extract these

CRITICAL VECKANS RULE:
• If you see "Veckans" followed by a COMPLETE dish name and description, EXTRACT IT
• "Veckans Moo Tod [with full description]" = extract as "Moo Tod - [full description]"
• "Veckans fisk: Lax med dillsås" = extract as "Lax med dillsås"
• DO NOT extract labels like "Veckans vegetariska" or "Veckans fisk" if they appear WITHOUT the actual dish name and description
• Only extract "Veckans X" items when X is followed by the complete dish details (ingredients, preparation, etc.)

EXTRACTION BOUNDARIES - HARD STOP RULES:
• IMMEDIATELY STOP reading when you see "Bärstronomi" - extract NOTHING after this word
• IMMEDIATELY STOP reading when you see "Bar" as a section header
• STOP at any pricing over 200kr (these are bar/dinner items)
• STOP when you see evening section markers: "kväll", "evening", "À la carte"

LUNCH SECTION IDENTIFICATION:
• ONLY extract from content that appears BEFORE "Bärstronomi"
• Look for clear lunch markers: "Lunchmeny", "Dagens", "Veckans"
• Extract from weekday schedules (Måndag-Fredag)
• Extract lunch-priced items (100-200kr range)

CRITICAL RULE: Once you encounter "Bärstronomi" or similar, STOP completely - do not extract anything that appears after it, even if it looks like lunch food

WEEK HANDLING:
Current week: ${weekNumber} (${isOddWeek ? 'ODD' : 'EVEN'} week)
• If restaurant has odd/even week menus, extract ONLY from the ${isOddWeek ? 'ODD' : 'EVEN'} week menu
• Do NOT mix dishes from both week types

WHAT TO EXCLUDE - ZERO TOLERANCE:
• EVERYTHING after "Bärstronomi" header - STOP reading completely
• EVERYTHING after "Bar" section headers
• ANY items over 200kr (bar/dinner pricing) UNLESS they are "Always available" items under 200kr
• Appetizers, desserts, drinks sections
• Evening menus: "Kvällsmeny", "À la carte"
• Duplicates of items already found in lunch sections
• Weekend dishes (lördag, söndag) - these are never extracted
• Dishes specifically labeled for other weekdays (e.g., "Tisdag:", "Onsdag:") - BUT ALWAYS INCLUDE vegetarian/vegan dishes regardless of their weekday labels
• CRITICAL EXCEPTION: ALWAYS extract "Vegetarisk/Vegetarian", "Vegan", "Alltid/Always" items even if they span multiple weekdays (e.g., "Mån-Ons", "Måndag-Onsdag")
• Informational text/notes that are NOT actual dishes (e.g., "Alla dagens går utmärkt att få vegetariskt", "Vi serverar", "Ingår i priset", general information about the restaurant or menu policies)
• Incomplete dish labels without actual dish names (e.g., "Veckans vegetariska", "Veckans fisk", "Dagens kött" when appearing alone without the complete dish description)

REMEMBER: "Bärstronomi" = FULL STOP. Extract ALL lunch items that appear BEFORE this section.

ANTI-HALLUCINATION RULES - CRITICAL:
• NEVER add Caesar sallad, Moo Tod, or other common dishes if they are not explicitly on this restaurant's menu
• NEVER use your training data to "fill in" typical lunch items
• ONLY extract dishes that are actually written in the provided content
• Extract ALL available lunch dishes - there is no minimum or maximum number required
• When in doubt, extract nothing rather than hallucinate dishes

LUNCH METADATA EXTRACTION:
• ALSO extract general lunch information that applies to all dishes:
• Serving times: Look for lunch hours in BOTH images and text context:
  - "Lunch serveras", "Lunch 11:30-14:00", "Öppet", opening hours
  - Daily schedules like "Onsdag: 11:30-21:00", "Wednesday: 11:30-21:00"
  - IMPORTANT: Use EXACT times found - if restaurant opens "11:30-21:00", use "11:30-21:00", NOT "11:30-14:00"
  - Only modify times if explicitly labeled as lunch-only hours
• Included items: Look for "ingår", "inkluderat", "sallad och bröd ingår", "kaffe ingår", etc.
• Special notes: Look for "buffé", "hämtlunch", "takeaway", "vegetariska alternativ", etc.

OUTPUT FORMAT:
• Include full dish descriptions with ingredients
• Type: "meat" (includes poultry), "fish" (includes seafood), "veg" (includes vegan)
• Use Swedish text only - ignore English translations
• Extract complete information, not just dish names
• Include lunch metadata when available

FINAL INSTRUCTION: Extract EVERY single dish that meets the criteria above. Do not stop after finding a few dishes - restaurants may have 10+ different options available.
SPECIAL NOTE: Pay extra attention to:
1. Fish dishes (salmon, tuna, etc.) - these are legitimate lunch options and should be included
2. Vegetarian dishes (marked as "Vegetarisk", "Vego", "Veg", or containing only plant-based ingredients) - NEVER skip these
3. Bowl restaurants often have 8-12 different bowl options
4. Multi-course restaurants often have both meat and vegetarian options for the same day

{
  "dishes": [{"title":"...","type":"veg|fish|meat"}],
  "confidence": 0.0,
  "reasoning": "...",
  "lunchInfo": {
    "servingTimes": "11:30-14:00" or null,
    "includedItems": ["sallad", "bröd", "smör"] or null,
    "specialNotes": "Buffé med vegetariska alternativ" or null
  }
}`;
};

/**
 * Creates the full prompt for menu extraction
 */
export const createMenuExtractionPrompt = (
  pageContent: PageContent,
  restaurantMeta: RestaurantMetaProps,
  locationFilter?: string,
): string => {
  const weekdaySv = new Date().toLocaleDateString('sv-SE', { weekday: 'long' });
  const isoDate = new Date().toISOString().slice(0, 10);

  const instructions = createMenuExtractionInstructions(weekdaySv, locationFilter);

  // Filter out evening menu content before sending to AI (only if content cleaning is enabled)
  const useContentCleaner = restaurantMeta.useContentCleaner ?? true; // Default to true if not specified
  const filteredText = useContentCleaner ? filterLunchContent(pageContent.text) : pageContent.text;

  return `TODAY_LOCAL: ${isoDate} (${weekdaySv})
RESTAURANT: ${restaurantMeta.title}
SOURCE_URL: ${pageContent.url}
PAGE_TEXT:
"""
${filteredText.slice(0, 30000)}
"""

${instructions}`;
};