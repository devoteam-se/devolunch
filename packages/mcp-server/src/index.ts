import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  Tool,
  ListToolsRequestSchema,
  ListToolsResultSchema,
  CallToolRequestSchema,
  CallToolResultSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Scrape, DishProps, RestaurantProps } from '@devolunch/shared';

const DEFAULT_SCRAPE_URL = process.env.MCP_SCRAPE_URL || 'http://localhost:8080/api/v1/restaurants';

async function fetchScrape(): Promise<Scrape> {
  const res = await fetch(DEFAULT_SCRAPE_URL);
  if (!res.ok) throw new Error(`Failed to fetch scrape: ${res.status}`);
  const data = (await res.json()) as Scrape;
  return data;
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD');

function filterRestaurants(restaurants: RestaurantProps[], query: string, language?: string): RestaurantProps[] {
  const q = norm(query.trim());
  if (!q) return restaurants;

  return restaurants.filter((r) => {
    const collections = r.dishCollection || [];
    const relevant = language ? collections.filter((c) => c.language === language) : collections;
    const scan = relevant.length ? relevant : collections;

    for (const col of scan) {
      for (const dish of col.dishes) {
        if (norm(dish.title).includes(q)) return true;
        if (dish.description && norm(dish.description).includes(q)) return true;
      }
    }
    return norm(r.title).includes(q);
  });
}

const tools: Tool[] = [
  {
    name: 'get_restaurants',
    description: 'Returns the latest restaurant scrape snapshot with menus and metadata.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'search_dishes',
    description:
      'Search dishes across restaurants. Input: query string, optional language code to prioritize matching language menus.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        language: { type: 'string' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
];

async function main() {
  const server = new Server(
    { name: '@devolunch/mcp-server', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  // tools/list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools } as unknown as typeof ListToolsResultSchema._type;
  });

  // tools/call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params ?? { name: '', arguments: {} };
    if (name === 'get_restaurants') {
      const scrape = await fetchScrape();
      const text = JSON.stringify(scrape);
      return { content: [{ type: 'text', text }] } as unknown as typeof CallToolResultSchema._type;
    }
    if (name === 'search_dishes') {
      const { query, language } = (args || {}) as { query: string; language?: string };
      if (!query || typeof query !== 'string') {
        throw new Error('query is required');
      }
      const scrape = await fetchScrape();
      const filtered = filterRestaurants(scrape.restaurants, query, language);
      const results = filtered.map((r) => {
        const collections = r.dishCollection || [];
        const rel = language ? collections.filter((c) => c.language === language) : collections;
        const scan = rel.length ? rel : collections;
        const matches: DishProps[] = [];
        for (const col of scan) {
          for (const dish of col.dishes) {
            const hay = `${dish.title} ${dish.description || ''}`;
            if (norm(hay).includes(norm(query))) matches.push(dish);
          }
        }
        return {
          restaurant: { title: r.title, url: r.url, googleMapsUrl: r.googleMapsUrl },
          dishes: matches,
        };
      });
      const text = JSON.stringify({ query, results });
      return { content: [{ type: 'text', text }] } as unknown as typeof CallToolResultSchema._type;
    }
    throw new Error(`Unknown tool: ${name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Start if run directly
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
