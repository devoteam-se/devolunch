import OpenAI from 'openai';
import { DishProps, RestaurantMetaProps } from '@devolunch/shared';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      console.log(`🖼️  Found ${pageContent.images?.length} images, using Vision API for menu extraction`);
      return await extractMenuFromImagesWithAI(pageContent, restaurantMeta, locationFilter);
    }

    const prompt = createMenuExtractionPrompt(pageContent, restaurantMeta, locationFilter);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective model good for structured tasks
      max_tokens: 1500, // Increased to handle multiple dishes
      temperature: 0.1,
      messages: [
        {
          role: 'system',
          content:
            "You are a precise menu extraction assistant for Swedish restaurants. Extract only today's lunch dishes. Exclude dinner/evening/à la carte items, sides, desserts, snacks, kids menus, and drinks. Output strictly valid JSON.",
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
    console.log(`🔍 Raw AI response before filtering:`, JSON.stringify(rawResult.dishes, null, 2));
    const result = normalizeResult(rawResult);
    console.log(`🤖 OpenAI extracted ${result.dishes.length} dishes with confidence ${result.confidence}`);
    console.log(`💭 Reasoning: ${result.reasoning}`);

    return result;
  } catch (error) {
    console.error('❌ AI menu extraction failed:', error);
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
        console.log(`⚠️ Skipping PDF URL for Vision API: ${imageUrl}`);
        return false;
      }

      if (isDataUrl && !imageUrl.startsWith('data:image/')) {
        console.log(`⚠️ Skipping non-image data URL: ${imageUrl.substring(0, 50)}...`);
        return false;
      }

      return isSupportedFormat || isDataUrl;
    });

    const messages: any[] = [
      {
        role: 'system',
        content:
          "You are a precise menu extraction assistant for Swedish restaurants. Extract only today's lunch dishes from menu images. Output strictly valid JSON.",
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: visionPrompt },
          ...supportedImages.slice(0, 4).map((imageUrl) => ({
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'high' },
          })),
        ],
      },
    ];

    console.log(`🖼️  Analyzing ${pageContent.images?.length} images with Vision API`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Vision model required for image analysis
      max_tokens: 1500,
      temperature: 0.1,
      messages,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response content from OpenAI Vision API');
    }

    const rawResult = parseAIResponse(responseText);
    console.log(`🔍 Raw Vision API response before filtering:`, JSON.stringify(rawResult.dishes, null, 2));
    const result = normalizeResult(rawResult);
    console.log(`🤖 OpenAI Vision extracted ${result.dishes.length} dishes with confidence ${result.confidence}`);
    console.log(`💭 Reasoning: ${result.reasoning}`);

    return result;
  } catch (error) {
    console.error('❌ Vision API menu extraction failed:', error);
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

  return `${locationInstruction}Extract ALL lunch dishes available today from LUNCH SECTIONS ONLY. Include:

WHAT TO INCLUDE (FROM LUNCH SECTIONS ONLY):
• Look for sections labeled: "Lunch", "Lunchmeny", "Dagens lunch", "Vardagslunch"
• CRITICAL: "Veckans" dishes MUST be included - these are weekly specials available every day
• Daily dishes for TODAY (${weekdaySv}) from weekday schedules IN LUNCH SECTIONS
• Always-available items: "Alltid", "Stående dagens", "Permanent menu"
• Vegetarian/vegan options from dedicated lunch sections
• Signature items, sandwiches, and lunch-priced dishes (100-250kr) from lunch areas

WEEKDAY HANDLING:
• Match Swedish/English: "${weekdaySv}/wednesday", "måndag/monday", etc.
• Handle ranges: "mån-ons", "måndag–onsdag" (include if today falls in range)
• Section headers like "Fisk måndag-onsdag" followed by dish descriptions

WEEK NUMBER HANDLING:
• Current week: ${weekNumber} (${isOddWeek ? 'ODD' : 'EVEN'} week)
• IMPORTANT: If restaurant has separate menus for odd/even weeks, extract ONLY from the ${
    isOddWeek ? 'ODD' : 'EVEN'
  } week menu
• Swedish terms: "udda veckor" (odd weeks), "jämna veckor" (even weeks)
• DO NOT mix dishes from both week types - select only the appropriate week

WHAT TO EXCLUDE:
• CRITICAL: Any dishes from "Kvällsmeny" or evening menu sections - LUNCH ONLY
• Generic categories like "Dagens Kött" (unless no specific dishes found)
• Service descriptions like "Serveras Måndag-Fredag", "Inkl. vatten, te & kaffe", opening hours, general info
• Text about lunch service, prices, or general restaurant information - NOT actual dishes
• Dinner/evening items: sections with "kväll", "kvällsmeny", "middag", "efter 17:00"
• Non-mains: "förrätt", "efterrätt", "dessert", "dryck"
• If page has both lunch and dinner sections, extract ONLY from lunch sections

OUTPUT:
• CRITICAL: Always include full dish information - NEVER just bare dish names
• If a dish has ingredients/description listed, include it: "Dish Name - ingredients and details"
• Extract complete dish information, not just titles
• IMPORTANT: Only extract ACTUAL DISHES - not service info, hours, or general descriptions
• Type: "meat" (includes poultry), "fish" (includes seafood), "veg" (includes vegan)
• Typical restaurant has 3-5 lunch options

Output exactly this JSON shape:
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
    const validDishes = parsed.dishes.filter((dish: any) => dish.title && typeof dish.title === 'string' && dish.type);

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

  console.log(`🔍 Debug filtering steps:`);

  let step1 = result.dishes.map((d) => ({ ...d, title: d.title.trim() }));
  console.log(`Step 1 - Trimmed: ${step1.length} dishes`);

  let step2 = step1.filter((d) => d.title.length > 0);
  console.log(`Step 2 - Non-empty: ${step2.length} dishes`);

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
  console.log(`Step 3 - After content filters: ${step3.length} dishes`);

  let step4 = step3.map((d) => ({ ...d, type: mapType(String(d.type), d.title) }));
  console.log(`Step 4 - After type mapping: ${step4.length} dishes`);

  let step5 = step4.filter((d) => {
    const passes = d.type !== 'misc';
    if (!passes) {
      console.log(`  ❌ Filtered out as misc: "${d.title}"`);
    }
    return passes;
  });
  console.log(`Step 5 - After misc filter: ${step5.length} dishes`);

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
