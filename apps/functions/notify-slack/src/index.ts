import * as ff from '@google-cloud/functions-framework';
import { createConfig } from './config.js';

interface DishProps {
  type?: string;
  title: string;
}

interface DishCollectionProps {
  language: string;
  dishes: DishProps[];
}

interface RestaurantProps {
  title: string;
  distance?: number;
  dishCollection?: DishCollectionProps[];
  locations?: LocationProps[];
}

interface LocationProps {
  title: string;
  dishCollection?: DishCollectionProps[];
}

const config = createConfig();

const hasMenuData = (restaurant: RestaurantProps): boolean => {
  // Check main restaurant dishCollection
  const hasMainMenu = restaurant.dishCollection?.some((dc: DishCollectionProps) => dc.dishes?.length > 0);

  // Check locations dishCollection
  const hasLocationMenus = restaurant.locations?.some((location: LocationProps) =>
    location.dishCollection?.some((dc: DishCollectionProps) => dc.dishes?.length > 0)
  );

  return hasMainMenu || hasLocationMenus || false;
};

const renderSummaryMessage = (restaurants: RestaurantProps[]) => {
  const today = new Date().toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const restaurantsWithMenus = restaurants.filter(hasMenuData);

  let result = `🍽️ *Lunch Menu ${today}*\n`;
  result += `📍 _${restaurantsWithMenus.length} restaurants in Malmö_\n\n`;
  result += `🔗 _Full details: <https://www.malmolunch.se|malmolunch.se>_`;
  return result;
};

const renderRestaurantChunk = (restaurants: RestaurantProps[], startIndex: number, chunkSize: number) => {
  const chunk = restaurants.slice(startIndex, startIndex + chunkSize);
  let result = '';

  chunk.forEach((restaurant, index) => {
    result += renderItemForMarkdown(restaurant, startIndex + index + 1);
  });

  return result.trim();
};

const getDishCollection = (dishCollection?: DishCollectionProps[]) => {
  // Try Swedish first, fallback to English, then any available language
  return dishCollection?.find((dc: { language: string }) => dc.language === 'sv') ||
         dishCollection?.find((dc: { language: string }) => dc.language === 'en') ||
         dishCollection?.[0];
};

const renderDishes = (dishCollection?: DishCollectionProps[]): string => {
  const availableDishes = getDishCollection(dishCollection);

  if (!availableDishes?.dishes?.length) {
    return '';
  }

  const dishTypeEmojis: Record<string, string> = {
    'meat': '🥩',
    'fish': '🐟',
    'vegetarian': '🥗',
    'vegan': '🌱'
  };

  let result = '';
  for (const dish of availableDishes.dishes) {
    const type = dish?.type?.toLowerCase() || '';
    const emoji = dishTypeEmojis[type] || '🍽️';
    const dishType = dish?.type?.replace(/\b\w/g, (l: string) => l.toUpperCase()) || '';

    result += `   ${emoji} ${dishType}: ${dish.title}\n`;
  }
  return result;
};

const renderItemForMarkdown = ({ title, dishCollection, locations }: RestaurantProps, index: number): string => {
  let result = `${index}. *${title}*\n`;

  // Check if restaurant has direct dishes
  const mainDishes = renderDishes(dishCollection);
  if (mainDishes) {
    result += mainDishes;
  }

  // Check if restaurant has location-based dishes
  if (locations?.length) {
    locations.forEach((location) => {
      const locationDishes = renderDishes(location.dishCollection);
      if (locationDishes) {
        // Only show location name if there are multiple locations or no main dishes
        if (locations.length > 1 || !mainDishes) {
          result += `   📍 _${location.title}_\n`;
        }
        result += locationDishes;
      }
    });
  }

  // If no dishes found at all, return empty
  if (result === `${index}. *${title}*\n`) {
    return '';
  }

  result += '\n';
  return result;
};


ff.http('notify-slack', async (_req: ff.Request, res: ff.Response) => {
  console.log('🚀 notify-slack function called');
  void _req;

  try {
    // send to slack - use local file for testing
    const fs = await import('fs');
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const scrapePath = join(__dirname, '..', '..', '..', 'functions', 'scraper', 'scrape.json');

    console.log(`📁 Reading local scrape.json from: ${scrapePath}`);
    const file = fs.readFileSync(scrapePath, 'utf8');
    const scrape = JSON.parse(file);
    console.log(`📊 Found ${scrape.restaurants?.length || 0} restaurants`);

    const sortedRestaurants = scrape.restaurants.sort(
    (a: RestaurantProps, b: RestaurantProps) =>
      (b.dishCollection?.filter((d: DishCollectionProps) => d.dishes?.length).length || 0) -
        (a.dishCollection?.filter((d: DishCollectionProps) => d.dishes?.length).length || 0) ||
      (a.distance && b.distance ? a.distance - b.distance : 0),
  );

    // Filter restaurants with actual menus
    const restaurantsWithMenus = sortedRestaurants.filter(hasMenuData);

    const summaryText = renderSummaryMessage(restaurantsWithMenus);

    console.log(`📝 Generated summary for ${restaurantsWithMenus.length} restaurants`);

    // Send main summary message
    console.log('📤 Sending Slack summary message...');
    const summaryResponse = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.slackOauthToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: config.slackChannelId,
        text: summaryText,
        mrkdwn: true,
      }),
    });

    const summaryData = await summaryResponse.json();
    if (!summaryData.ok) {
      throw new Error(`Summary message post error: ${summaryData.error}`);
    }

    console.log('✅ Summary message sent! Now sending restaurant details in thread...');

    // Send restaurant details in threaded chunks
    const chunkSize = 8; // Restaurants per thread message
    let totalSent = 0;

    for (let i = 0; i < restaurantsWithMenus.length; i += chunkSize) {
      const chunkText = renderRestaurantChunk(restaurantsWithMenus, i, chunkSize);

      if (!chunkText) continue;

      const threadResponse = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.slackOauthToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: config.slackChannelId,
          text: chunkText,
          thread_ts: summaryData.ts,
          mrkdwn: true,
        }),
      });

      const threadData = await threadResponse.json();
      if (!threadData.ok) {
        console.warn(`⚠️ Failed to send thread chunk ${i / chunkSize + 1}: ${threadData.error}`);
      } else {
        totalSent += Math.min(chunkSize, restaurantsWithMenus.length - i);
        console.log(`📤 Sent restaurants ${i + 1}-${Math.min(i + chunkSize, restaurantsWithMenus.length)} to thread`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => globalThis.setTimeout(resolve, 100));
    }

    console.log(`✅ All messages sent successfully! Total restaurants: ${totalSent}`);
    res.status(200).json({
      success: true,
      message: 'Slack notification sent successfully',
      messageTs: summaryData.ts,
      restaurants: totalSent,
      threaded: true,
      chunkSize: chunkSize
    });

  } catch (err) {
    console.error('❌ Error in notify-slack function:', err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return;
  }
});
