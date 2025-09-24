import type { ChatCompletionMessageParam, ChatCompletionContentPart } from 'openai/resources/chat/completions';
import type { RestaurantMetaProps } from '@devolunch/shared';
import { logger } from '@devolunch/shared/logger/node';

import { getOpenAI } from '../clients/openai.js';
import { createMenuExtractionPrompt, createMenuExtractionInstructions } from '../prompts/menuExtraction.js';
import { parseAIResponse, normalizeResult } from '../parsers/aiResponse.js';
import type { PageContent, MenuExtractionResult } from '../types/index.js';

/**
 * Main entry point for AI-powered menu extraction
 */
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
      max_tokens: 3000, // Increased to handle many dishes
      temperature: 0.0, // Use lowest temperature to reduce hallucinations
      messages: [
        {
          role: 'system',
          content:
            "You are a precise menu extraction assistant for Swedish restaurants. Extract dishes that appear on the menu for TODAY'S weekday, AND always include vegetarian/vegan options even if they span multiple days (e.g., 'Mån-Ons'). NEVER add or invent dishes that are not explicitly listed. Exclude dinner/evening/à la carte items, sides, desserts, snacks, kids menus, and drinks. Output strictly valid JSON.",
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
      reasoning: `AI extraction failed: ${error}`,
    };
  }
};

/**
 * Extracts menu from images using OpenAI Vision API
 */
const extractMenuFromImagesWithAI = async (
  pageContent: PageContent,
  _restaurantMeta: RestaurantMetaProps,
  locationFilter?: string,
): Promise<MenuExtractionResult> => {
  try {
    const weekdaySv = new Date().toLocaleDateString('sv-SE', { weekday: 'long' });
    const instructions = createMenuExtractionInstructions(weekdaySv, locationFilter);

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          "You are a precise menu extraction assistant for Swedish restaurants. Extract dishes that appear on the menu for TODAY'S weekday, AND always include vegetarian/vegan options even if they span multiple days (e.g., 'Mån-Ons'). NEVER add or invent dishes that are not explicitly listed. Exclude dinner/evening/à la carte items, sides, desserts, snacks, kids menus, and drinks. Output strictly valid JSON.",
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${instructions}\\n\\nPlease analyze these menu images and extract lunch dishes according to the instructions above.`,
          },
          ...(pageContent.images?.slice(0, 4).map(
            (imageUrl): ChatCompletionContentPart => ({
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high',
              },
            }),
          ) || []),
        ],
      },
    ];

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o', // Vision requires gpt-4o
      max_tokens: 3000,
      temperature: 0.0,
      messages,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response content from OpenAI Vision API');
    }

    const rawResult = parseAIResponse(responseText);
    const result = normalizeResult(rawResult);
    logger.info(
      { count: result.dishes.length, confidence: result.confidence },
      'OpenAI Vision extracted dishes',
    );
    logger.debug({ reasoning: result.reasoning }, 'AI Vision reasoning');

    return result;
  } catch (error) {
    logger.error({ err: error }, 'Vision API extraction failed');
    return {
      dishes: [],
      confidence: 0,
      reasoning: `Vision API Error: ${error}`,
    };
  }
};

// Re-export types for backward compatibility
export type { PageContent, MenuExtractionResult };