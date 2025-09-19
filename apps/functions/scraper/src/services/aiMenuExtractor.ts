import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionContentPart } from 'openai/resources/chat/completions';
import { DishProps, RestaurantMetaProps } from '@devolunch/shared';
import { logger } from '../utils/logger.js';

// Lazy initialize OpenAI client
let openai: OpenAI | null = null;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

export interface PageContent {
  html: string;
  text: string;
  title: string;
  url: string;
  images?: string[];
}

export interface MenuExtractionResult {
  dishes: DishProps[];
  confidence: number;
  reasoning: string;
}

export const extractMenuWithAI = async (
  pageContent: PageContent,
  restaurantMeta: RestaurantMetaProps,
  locationFilter?: string,
): Promise<MenuExtractionResult> => {
  try {
    // Check if we have images that might contain menu information
    const hasMenuImages = pageContent.images && pageContent.images.length > 0;

    if (hasMenuImages) {
      logger.info(
        { imageCount: pageContent.images?.length || 0 },
        'Found images; using Vision API for menu extraction',
      );
      return await extractMenuFromImagesWithAI(pageContent, restaurantMeta, locationFilter);
    }

    const prompt = createMenuExtractionPrompt(pageContent, restaurantMeta, locationFilter);

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model good for structured tasks
      max_tokens: 1500, // Increased to handle multiple dishes
      temperature: 0.0, // Use lowest temperature to reduce hallucinations
      messages: [
        {
          role: 'system',
          content:
            "You are a precise menu extraction assistant for Swedish restaurants. Extract ONLY dishes that actually appear on the provided menu content. NEVER add or invent dishes that are not explicitly listed. Exclude dinner/evening/à la carte items, sides, desserts, snacks, kids menus, and drinks. Output strictly valid JSON.",
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response content from OpenAI');
    }

    const rawResult = parseAIResponse(responseText);
    const result = normalizeResult(rawResult);
    logger.info(
      { count: result.dishes.length, confidence: result.confidence },
      'OpenAI extracted dishes',
    );
    logger.debug({ reasoning: result.reasoning }, 'AI reasoning');

    return result;
  } catch (error) {
    logger.error({ err: error }, 'AI menu extraction failed');
    return {
      dishes: [],
      confidence: 0,
      reasoning: `Error: ${error}`,
    };
  }
};

// Extract menu from images using OpenAI Vision API
const extractMenuFromImagesWithAI = async (
  pageContent: PageContent,
  restaurantMeta: RestaurantMetaProps,
  locationFilter?: string,
): Promise<MenuExtractionResult> => {
  try {
    const weekdaySv = new Date().toLocaleDateString('sv-SE', { weekday: 'long' });
    const isoDate = new Date().toISOString().slice(0, 10);

    const instructions = createMenuExtractionInstructions(weekdaySv, locationFilter);

    const visionPrompt = `TODAY_LOCAL: ${isoDate} (${weekdaySv})
RESTAURANT: ${restaurantMeta.title}
SOURCE_URL: ${pageContent.url}
- Extract ALL lunch dishes served today from these menu images. Look for lunch sections, daily specials, and lunch pricing.

${instructions}`;

    // Filter out unsupported image formats and PDFs for Vision API
    const supportedImages = (pageContent.images || []).filter((imageUrl) => {
      const isPdf = imageUrl.toLowerCase().includes('.pdf');
      const isDataUrl = imageUrl.startsWith('data:');
      const isSupportedFormat = /\.(png|jpe?g|gif|webp)(\?|$)/i.test(imageUrl);

      if (isPdf) {
        logger.warn({ imageUrl }, 'Skipping PDF URL for Vision API');
        return false;
      }

      if (isDataUrl && !imageUrl.startsWith('data:image/')) {
        logger.warn({ imageUrl: imageUrl.substring(0, 50) + '...' }, 'Skipping non-image data URL');
        return false;
      }

      return isSupportedFormat || isDataUrl;
    });

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          "You are a precise menu extraction assistant for Swedish restaurants. Extract ONLY dishes that actually appear in the provided menu images. NEVER add or invent dishes that are not explicitly shown. Extract only today's lunch dishes from menu images. Output strictly valid JSON.",
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: visionPrompt } as ChatCompletionContentPart,
          ...supportedImages.slice(0, 4).map((imageUrl) => ({
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'high' },
          } as ChatCompletionContentPart)),
        ],
      },
    ];

    console.log(`🖼️  Analyzing ${pageContent.images?.length} images with Vision API`);

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o', // Vision model required for image analysis
      max_tokens: 1500,
      temperature: 0.0, // Use lowest temperature to reduce hallucinations
      messages,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response content from OpenAI Vision API');
    }

    const rawResult = parseAIResponse(responseText);
    logger.debug({ dishes: rawResult.dishes }, 'Raw Vision API response before filtering');

    const result = normalizeResult(rawResult);
    logger.info(
      { count: result.dishes.length, confidence: result.confidence },
      'OpenAI Vision extracted dishes',
    );
    logger.debug({ reasoning: result.reasoning }, 'AI reasoning');

    return result;
  } catch (error) {
    logger.error({ err: error }, 'Vision API menu extraction failed');
    return {
      dishes: [],
      confidence: 0,
      reasoning: `Vision API Error: ${error}`,
    };
  }
};

// Shared extraction instructions used by both text and vision AI models
const createMenuExtractionInstructions = (weekdaySv: string, locationFilter?: string): string => {
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

WHAT TO INCLUDE - MANDATORY EXTRACTION:
• PRIORITY 1: ANY "Veckans" items - ALWAYS extract these weekly specials (remove "Veckans" prefix from title)
• PRIORITY 2: Daily dishes for TODAY (${weekdaySv}) from weekday schedules
• PRIORITY 3: Items with lunch pricing (100-200kr)
• CRITICAL: ONLY extract dishes that ACTUALLY APPEAR on the menu - DO NOT add common lunch items if they are not explicitly listed

CRITICAL VECKANS RULE:
• If you see "Veckans" followed by any dish name, EXTRACT IT
• "Veckans Moo Tod" = extract as "Moo Tod - [full description]"
• "Veckans vegetariska" = extract the vegetarian dish
• "Veckans fisk" = extract the fish dish
• These are weekly specials available every day

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
• ANY items over 200kr (bar/dinner pricing)
• Appetizers, desserts, drinks sections
• Evening menus: "Kvällsmeny", "À la carte"
• Duplicates of items already found in lunch sections

REMEMBER: "Bärstronomi" = FULL STOP. Extract only the 4 lunch items that appear BEFORE this section.

ANTI-HALLUCINATION RULES - CRITICAL:
• NEVER add Caesar sallad, Moo Tod, or other common dishes if they are not explicitly on this restaurant's menu
• NEVER use your training data to "fill in" typical lunch items
• ONLY extract dishes that are actually written in the provided content
• If you cannot find 4 lunch dishes, extract fewer dishes rather than inventing new ones
• When in doubt, extract nothing rather than hallucinate dishes

OUTPUT FORMAT:
• Include full dish descriptions with ingredients
• Type: "meat" (includes poultry), "fish" (includes seafood), "veg" (includes vegan)
• Use Swedish text only - ignore English translations
• Extract complete information, not just dish names

{"dishes":[{"title":"...","type":"veg|fish|meat"}],"confidence":0.0,"reasoning":"..."}`;
};

// Filter out evening menu content to focus only on lunch sections
const filterLunchContent = (text: string): string => {
  const lines = text.split('\n');
  const filteredLines: string[] = [];
  let inEveningSection = false;

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    // Detect start of evening sections
    if (
      lowerLine.includes('kvällsmeny') ||
      lowerLine.includes('evening menu') ||
      lowerLine.includes('dinner menu') ||
      lowerLine.includes('à la carte') ||
      (lowerLine.includes('khai vị') && lowerLine.includes('förrätter')) ||
      (lowerLine.includes('món chính') && lowerLine.includes('huvudrätter')) ||
      (lowerLine.includes('tráng miệng') && lowerLine.includes('efterrätter'))
    ) {
      inEveningSection = true;
      continue;
    }

    // Detect start of lunch sections
    if (
      (lowerLine.includes('lunch') || lowerLine.includes('veckans')) &&
      !lowerLine.includes('kväll') &&
      !lowerLine.includes('dinner')
    ) {
      inEveningSection = false;
    }

    // Skip evening content
    if (inEveningSection) {
      continue;
    }

    // Include lunch content and general content (when not in evening section)
    filteredLines.push(line);
  }

  return filteredLines.join('\n');
};

const createMenuExtractionPrompt = (
  pageContent: PageContent,
  restaurantMeta: RestaurantMetaProps,
  locationFilter?: string,
): string => {
  const weekdaySv = new Date().toLocaleDateString('sv-SE', { weekday: 'long' });
  const isoDate = new Date().toISOString().slice(0, 10);

  const instructions = createMenuExtractionInstructions(weekdaySv, locationFilter);

  // Filter out evening menu content before sending to AI
  const filteredText = filterLunchContent(pageContent.text);

  return `TODAY_LOCAL: ${isoDate} (${weekdaySv})
RESTAURANT: ${restaurantMeta.title}
SOURCE_URL: ${pageContent.url}
PAGE_TEXT:
"""
${filteredText.slice(0, 8000)}
"""

${instructions}`;
};

const parseAIResponse = (responseText: string): MenuExtractionResult => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (!parsed.dishes || !Array.isArray(parsed.dishes)) {
      throw new Error('Invalid dishes array in response');
    }

    // Validate each dish
    const validDishes = parsed.dishes.filter((dish: { title?: string; type?: string }) =>
      dish.title && typeof dish.title === 'string' && dish.type
    );

    return {
      dishes: validDishes,
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
      reasoning: parsed.reasoning || 'No reasoning provided',
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      dishes: [],
      confidence: 0,
      reasoning: `Parse error: ${error}`,
    };
  }
};

// Normalize AI output to repository schema and add safety guards
const normalizeResult = (result: MenuExtractionResult): MenuExtractionResult => {
  const dinnerCues =
    /(kväll|kvällsmeny|afton|middag|à\s*la\s*carte|after\s*work|\bAW\b|helgmeny|från\s*(1[7-9]|2[0-3])|\b1[7-9][:.,]|\b2[0-3][:.,])/i;
  const nonMainCues = /(förrätt|efterrätt|dessert|tillval|smårätter|snacks|dryck)/i;
  const headingCues = /(^lunchmeny$|^veck[aå]ns?\s*(lunch|meny)$)/i;

  const mapType = (t: string, title: string): 'meat' | 'fish' | 'veg' | 'misc' | 'vegan' => {
    const lt = String(t).toLowerCase();
    // Trust AI's classification first - it's better at understanding context
    if (lt === 'vegan') return 'vegan';
    if (lt === 'veg' || lt === 'vegetarian') return 'veg';
    if (lt === 'fish' || lt === 'seafood') return 'fish';
    if (lt === 'meat') return 'meat';
    // Only use heuristics as fallback for unrecognized types
    // Seafood / fish cues (Swedish + Thai transliteration)
    if (/(lax|fisk|räk|torsk|spätta|sill|tonfisk|havskräft|hummer|bläckfisk|pla\b)/i.test(title)) return 'fish';
    // Meat cues (Swedish + Thai transliteration)
    if (
      /(kyckling|fläsk|nöt|biff|lam|lamm|kött|sida|salsiccia|pancetta|skinka|karré|högrev|\bmoo\b|\bgai\b|\bnua\b|\bgo?o?ng\b|\bkung\b)/i.test(
        title,
      )
    )
      return 'meat';
    if (
      /(veg|vego|vegan|tofu|falafel|halloumi|sallad|aubergine|zucchini|svamp|kantarell|broccoli|blomkål)/i.test(title)
    )
      return 'veg';
    return 'misc';
  };

  const stripPrice = (s: string) => s.replace(/\s*[–—-]\s*\d{2,3}(\s*kr)?\b/gi, '').replace(/\b\d{2,3}\s*kr\b/gi, '');
  const cleanForDedup = (s: string) => stripPrice(s).replace(/\s+/g, ' ').trim().toLowerCase();

  // Weekday range filter (e.g., "Fisk måndag–onsdag", "Mån-Ons:")

  const seen = new Set<string>();

  let step1 = result.dishes.map((d) => ({ ...d, title: d.title.trim() }));
  let step2 = step1.filter((d) => d.title.length > 0);
  let step3 = step2.filter((d) => {
    // Skip day filtering since AI already filtered for today's dishes
    // Don't filter out weekly specials even if they have "veckans" which might be caught by headingCues
    const isWeeklySpecial = /veckans/i.test(d.title);
    const passes =
      !dinnerCues.test(d.title) && !nonMainCues.test(d.title) && (!headingCues.test(d.title) || isWeeklySpecial);
    if (!passes) {
      console.log(
        `  ❌ Filtered out: "${d.title}" - dinner: ${dinnerCues.test(d.title)}, nonMain: ${nonMainCues.test(
          d.title,
        )}, heading: ${headingCues.test(d.title)}, weekly: ${isWeeklySpecial}`,
      );
    }
    return passes;
  });
  let step4 = step3.map((d) => ({ ...d, type: mapType(String(d.type), d.title) }));
  let step5 = step4.filter((d) => {
    const passes = d.type !== 'misc';
    if (!passes) {
      console.log(`  ❌ Filtered out as misc: "${d.title}"`);
    }
    return passes;
  });
  let step6 = step5.map((d) => ({ ...d, type: d.type === 'vegan' ? 'veg' : d.type }));

  const filtered = step6
    .filter((d) => {
      const key = cleanForDedup(d.title);
      if (seen.has(key)) {
        console.log(`  ❌ Filtered out as duplicate: "${d.title}"`);
        return false;
      }
      seen.add(key);
      return true;
    })
    .map((d) => ({ ...d, title: stripPrice(d.title).replace(/\s+/g, ' ').trim() }));

  return { ...result, dishes: filtered };
};
