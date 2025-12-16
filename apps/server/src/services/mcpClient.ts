// What: Minimal MCP client spawner for server-side REST bridge
// Why: Allow Express route to call MCP tools via stdio child process

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// From apps/server/src/services -> root requires four levels up
const repoRoot = resolve(__dirname, '..', '..', '..', '..');

function getServerCommand(): { command: string; args: string[] } {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    return { command: 'tsx', args: [resolve(repoRoot, 'packages/mcp-server/src/index.ts')] };
  }
  return { command: 'node', args: [resolve(repoRoot, 'packages/mcp-server/dist/mcp-server/src/index.js')] };
}

let clientSingleton: Client | null = null;
let connecting: Promise<Client> | null = null;
type CacheEntry = { value: any; expires: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000; // 60 seconds

function cacheKey(name: string, args?: Record<string, unknown>): string {
  return `${name}:${JSON.stringify(args || {})}`;
}

async function getClient(): Promise<Client> {
  if (clientSingleton) return clientSingleton;
  if (connecting) return connecting;

  const { command, args } = getServerCommand();
  const client = new Client({ name: '@devolunch/server-bridge', version: '0.1.0' }, { capabilities: {} });
  const transport = new StdioClientTransport({
    command,
    args,
    env: { ...process.env, MCP_SCRAPE_URL: `http://localhost:${config.port}/api/v1/restaurants` },
  });

  connecting = (async () => {
    await client.connect(transport);
    // Warm up: ensure tools available
    await client.listTools().catch(() => undefined);
    client.onclose = () => {
      clientSingleton = null;
      connecting = null;
    };
    client.onerror = () => {
      // keep process alive; next call may recreate
    };
    clientSingleton = client;
    return client;
  })();

  return connecting;
}

export async function callSearchDishes(params: { query: string; language?: string; expand?: boolean }) {
  // Cached path
  const key = cacheKey('search_dishes', params as Record<string, unknown>);
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expires > now) return hit.value;

  const client = await getClient();
  const result = await client.callTool({ name: 'search_dishes', arguments: params });
  const first = (result as any).content?.[0];
  if (!first || first.type !== 'text') throw new Error('invalid_tool_result');
  const parsed = JSON.parse(first.text);
  cache.set(key, { value: parsed, expires: now + CACHE_TTL_MS });
  return parsed;
}

export async function mcpListTools() {
  const client = await getClient();
  return client.listTools();
}

export async function mcpCallTool(params: { name: string; arguments?: Record<string, unknown> }) {
  // Cache only for search_dishes
  if (params.name === 'search_dishes') {
    const key = cacheKey(params.name, params.arguments);
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && hit.expires > now) {
      // Re-wrap into MCP result format (text content)
      const text = JSON.stringify(hit.value);
      return { content: [{ type: 'text', text }] };
    }
  }

  const client = await getClient();
  const result = await client.callTool(params);

  if (params.name === 'search_dishes') {
    const first = (result as any).content?.[0];
    if (first && first.type === 'text') {
      try {
        const parsed = JSON.parse(first.text);
        cache.set(cacheKey(params.name, params.arguments), { value: parsed, expires: Date.now() + CACHE_TTL_MS });
      } catch {
        // ignore parse errors for caching
      }
    }
  }
  return result;
}

export async function callSuggestMeal(params: { query: string; language?: string; topK?: number; useLLM?: boolean }) {
  // Cache suggestions similarly (short TTL) keyed by args
  const key = cacheKey('suggest_meal', params as Record<string, unknown>);
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expires > now) return hit.value;

  const client = await getClient();
  const result = await client.callTool({ name: 'suggest_meal', arguments: params });
  const first = (result as any).content?.[0];
  if (!first || first.type !== 'text') throw new Error('invalid_tool_result');
  const parsed = JSON.parse(first.text);
  cache.set(key, { value: parsed, expires: now + CACHE_TTL_MS });
  return parsed;
}

process.on('SIGINT', async () => {
  if (clientSingleton) {
    await clientSingleton.close().catch(() => undefined);
  }
  process.exit(0);
});

export async function warmMcp() {
  try {
    const client = await getClient();
    await client.listTools();
  } catch {
    // ignore; background reconnect will take over
  }
}
