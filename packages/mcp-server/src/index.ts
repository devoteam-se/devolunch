import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  Tool,
  ListToolsRequestSchema,
  ListToolsResultSchema,
  CallToolRequestSchema,
  CallToolResultSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Scrape, DishProps, RestaurantProps, expandQuery } from '@devolunch/shared';

const DEFAULT_SCRAPE_URL = process.env.MCP_SCRAPE_URL || 'http://localhost:8080/api/v1/restaurants';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function fetchScrape(): Promise<Scrape> {
  const res = await fetch(DEFAULT_SCRAPE_URL);
  if (!res.ok) throw new Error(`Failed to fetch scrape: ${res.status}`);
  const data = (await res.json()) as Scrape;
  return data;
}

const norm = (s: string) => s.toLowerCase().normalize('NFKD');

async function callOpenAIChatJSON(
  system: string,
  user: string,
  model = process.env.OPENAI_MODEL || 'gpt-4o-mini',
) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('No content from OpenAI');
  return JSON.parse(content);
}

async function llmExpandTokens(query: string, language = 'sv'): Promise<string[]> {
  if (!OPENAI_API_KEY) return [];
  try {
    const sys =
      'You expand food queries into a small set of synonyms and closely related dish names. Respond as JSON {"synonyms":[...]} with max 8 entries, lowercase.';
    const usr = `Query: ${query}\nLanguage: ${language}\nReturn synonyms and related dish names (Swedish if applicable).`;
    const json = await callOpenAIChatJSON(sys, usr);
    const arr: unknown = json?.synonyms;
    return Array.isArray(arr) ? arr.map((s) => String(s)) : [];
  } catch {
    return [];
  }
}

function filterRestaurants(
  restaurants: RestaurantProps[],
  query: string,
  language?: string,
  expand = true,
  extraTokens: string[] = [],
): { restaurant: RestaurantProps; matches: DishProps[]; reason: string }[] {
  const q = norm(query.trim());
  if (!q) {
    return restaurants.map((r) => ({ restaurant: r, matches: [], reason: 'empty-query' }));
  }

  const { tokens, primary } = expand ? expandQuery(q, language || 'sv') : { tokens: [q], primary: q };
  for (const t of extraTokens) tokens.push(norm(t));

  return restaurants
    .map((r) => {
      const collections = r.dishCollection || [];
      const relevant = language ? collections.filter((c) => c.language === language) : collections;
      const scan = relevant.length ? relevant : collections;

      const matches: DishProps[] = [];
      let matchedToken: string | null = null;
      for (const col of scan) {
        for (const dish of col.dishes) {
          const hay = `${dish.title} ${dish.description || ''}`;
          const nh = norm(hay);
          for (const t of tokens) {
            if (nh.includes(t)) {
              matches.push(dish);
              matchedToken = matchedToken || t;
              break;
            }
          }
        }
      }

      // Fallback: title match
      if (!matches.length) {
        for (const t of tokens) {
          if (norm(r.title).includes(t)) {
            matchedToken = matchedToken || t;
            break;
          }
        }
      }

      // Score: prefer primary token matches, then count of matches
      const score = (!matches.length && !matchedToken ? 0 : 1) + (matchedToken === primary ? 1 : 0) + matches.length * 0.01;
      const reason = matchedToken ? (matchedToken === primary ? 'exact-or-fuzzy' : 'synonym') : 'title-match';
      return { restaurant: r, matches, reason, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ score: _s, ...rest }) => rest);
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
  {
    name: 'suggest_meal',
    description:
      'Suggest top dishes and restaurants matching a query, optionally using LLM expansion. Returns reasons and ranked results.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        language: { type: 'string' },
        topK: { type: 'number' },
        useLLM: { type: 'boolean' },
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
      const { query, language, expand } = (args || {}) as { query: string; language?: string; expand?: boolean };
      if (!query || typeof query !== 'string') {
        throw new Error('query is required');
      }
      const scrape = await fetchScrape();
      // Optional LLM token expansion for search
      const extra = expand ? await llmExpandTokens(query, language || 'sv') : [];
      const filtered = filterRestaurants(scrape.restaurants, query, language, expand ?? true, extra);
      const results = filtered.map(({ restaurant, matches, reason }) => ({
        restaurant: { title: restaurant.title, url: restaurant.url, googleMapsUrl: restaurant.googleMapsUrl },
        reason,
        dishes: matches,
      }));
      const text = JSON.stringify({ query, results });
      return { content: [{ type: 'text', text }] } as unknown as typeof CallToolResultSchema._type;
    }
    if (name === 'suggest_meal') {
      const { query, language, topK, useLLM } = (args || {}) as {
        query: string;
        language?: string;
        topK?: number;
        useLLM?: boolean;
      };
      if (!query || typeof query !== 'string') throw new Error('query is required');
      const scrape = await fetchScrape();
      const extra = useLLM ? await llmExpandTokens(query, language || 'sv') : [];
      const prelim = filterRestaurants(scrape.restaurants, query, language, true, extra);
      // Flatten candidates (cap to keep prompt small)
      const candidates: { restaurant: string; dish: string }[] = [];
      for (const r of prelim) {
        for (const d of r.matches) {
          candidates.push({ restaurant: r.restaurant.title, dish: d.title });
          if (candidates.length >= 40) break;
        }
        if (candidates.length >= 40) break;
      }

      let suggestions: unknown = null;
      if (OPENAI_API_KEY && (useLLM ?? true) && candidates.length) {
        try {
          const sys = 'You are a helpful lunch assistant. Rank and justify dish choices based on user intent.';
          const usr = `User query: ${query}\nLanguage: ${language || 'sv'}\nCandidates (restaurant - dish):\n${candidates
            .map((c, i) => `${i + 1}. ${c.restaurant} - ${c.dish}`)
            .join('\n')}\nReturn JSON {"suggestions":[{"restaurant":"...","dish":"...","reason":"..."}]}, max ${(topK ?? 5)} entries.`;
          const json = await callOpenAIChatJSON(sys, usr);
          suggestions = json?.suggestions;
        } catch {
          suggestions = null;
        }
      }

      type Suggestion = { restaurant: string; dish?: string; reason?: string };
      let results: Suggestion[];
      if (Array.isArray(suggestions) && suggestions.length) {
        results = (suggestions as unknown[])
          .map((s) => {
            const o = s as Record<string, unknown>;
            return { restaurant: String(o.restaurant || ''), dish: o.dish ? String(o.dish) : undefined, reason: o.reason ? String(o.reason) : undefined } as Suggestion;
          })
          .filter((s) => s.restaurant)
          .slice(0, topK ?? 5);
      } else {
        // Fallback: take top prelim matches
        results = prelim
          .slice(0, topK ?? 5)
          .map((r) => ({ restaurant: r.restaurant.title, dish: r.matches[0]?.title, reason: r.reason }));
      }

      const text = JSON.stringify({ query, results });
      return { content: [{ type: 'text', text }] } as unknown as typeof CallToolResultSchema._type;
    }
    throw new Error(`Unknown tool: ${name}`);
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// Start if run directly
void main();
