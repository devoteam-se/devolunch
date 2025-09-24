import { logger } from '@devolunch/shared/logger/node';
import type { MenuExtractionResult } from '../types/index.js';

/**
 * Parses AI response text to extract menu data
 */
export const parseAIResponse = (responseText: string): MenuExtractionResult => {
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
      lunchInfo: parsed.lunchInfo || undefined,
    };
  } catch (error) {
    logger.error({ err: error }, 'Failed to parse AI response');
    return {
      dishes: [],
      confidence: 0,
      reasoning: `Parse error: ${error}`,
    };
  }
};

/**
 * Normalizes AI output to repository schema and adds safety guards
 */
export const normalizeResult = (result: MenuExtractionResult): MenuExtractionResult => {
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

    // As a fallback, attempt heuristic detection
    const titleLower = title.toLowerCase();
    const fishWords = ['fisk', 'lax', 'tonfisk', 'torsk', 'räkor', 'kräftor', 'skaldjur', 'fish', 'salmon', 'tuna'];
    const vegWords = ['vegetarisk', 'vegansk', 'vegan', 'tofu', 'quinoa', 'falafel', 'svamp', 'böna', 'bean'];

    if (fishWords.some(word => titleLower.includes(word))) return 'fish';
    if (vegWords.some(word => titleLower.includes(word))) return 'veg';

    return 'meat'; // Default to meat if unclear
  };

  const validDishes = result.dishes
    .filter((dish) => {
      const title = (dish.title || '').trim();

      // Skip empty or very short titles
      if (!title || title.length < 3) return false;

      // Skip dinner/evening items based on title
      if (dinnerCues.test(title)) return false;

      // Skip non-main dishes
      if (nonMainCues.test(title)) return false;

      // Skip menu headings that were extracted as dishes
      if (headingCues.test(title)) return false;

      return true;
    })
    .map((dish) => ({
      ...dish,
      title: (dish.title || '').trim(),
      type: mapType(dish.type || '', dish.title || ''),
    }));

  return {
    ...result,
    dishes: validDishes,
    confidence: Math.max(0, Math.min(1, result.confidence)),
  };
};