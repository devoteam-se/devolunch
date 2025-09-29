// What: Browser MCP client over WebSocket with lazy singleton connect
// Why: Call MCP tools directly from the client; REST remains as fallback

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { WebSocketClientTransport } from '@modelcontextprotocol/sdk/client/websocket.js';
import { ENVIRONMENT } from './constants';
import type { AiSearchResult } from './api';

let clientPromise: Promise<Client> | null = null;
type McpStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
let status: McpStatus = 'disconnected';
const listeners = new Set<(s: McpStatus) => void>();
function setStatus(s: McpStatus) {
  status = s;
  listeners.forEach((cb) => cb(s));
}

let backoffMs = 500; // start at 0.5s
const MAX_BACKOFF = 15000; // 15s

function wsUrl(): string {
  if (ENVIRONMENT.isDev) {
    return 'ws://localhost:8080/mcp';
  }
  const loc = window.location;
  const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${loc.host}/mcp`;
}

async function getClient(): Promise<Client> {
  if (clientPromise) return clientPromise;
  clientPromise = (async () => {
    setStatus('connecting');
    try {
      const client = new Client({ name: 'devolunch-web', version: '0.1.0' }, { capabilities: {} });
      const transport = new WebSocketClientTransport(new URL(wsUrl()));
      await client.connect(transport);
      await client.listTools();
      backoffMs = 500; // reset on success
      setStatus('connected');
      client.onclose = () => {
        clientPromise = null;
        setStatus('disconnected');
        scheduleReconnect();
      };
      client.onerror = () => {
        setStatus('error');
      };
      return client;
    } catch (e) {
      clientPromise = null;
      setStatus('error');
      scheduleReconnect();
      throw e;
    }
  })();
  return clientPromise;
}

export async function mcpSearch(query: string, language: string, expand = true): Promise<AiSearchResult> {
  const client = await getClient();
  const result = await client.callTool({ name: 'search_dishes', arguments: { query, language, expand } });
  const first = (result as { content?: Array<{ type: string; text: string }> }).content?.[0];
  if (!first || first.type !== 'text') throw new Error('invalid_tool_result');
  return JSON.parse(first.text);
}

export type AiSuggestionResult = {
  query: string;
  results: { restaurant: string; dish?: string; reason?: string }[];
};

export async function mcpSuggestMeal(
  query: string,
  language: string,
  topK = 5,
  useLLM = true
): Promise<AiSuggestionResult> {
  const client = await getClient();
  const result = await client.callTool({
    name: 'suggest_meal',
    arguments: { query, language, topK, useLLM }
  });
  const first = (result as { content?: Array<{ type: string; text: string }> }).content?.[0];
  if (!first || first.type !== 'text') throw new Error('invalid_tool_result');
  return JSON.parse(first.text);
}

// Background reconnection
function scheduleReconnect() {
  // Avoid parallel schedules
  if (clientPromise) return;
  const delay = backoffMs;
  backoffMs = Math.min(MAX_BACKOFF, Math.floor(backoffMs * 1.8));
  setTimeout(() => {
    // Trigger a connection attempt; ignore errors
    getClient().catch(() => undefined);
  }, delay);
}

export function onMcpStatus(listener: (s: McpStatus) => void): () => void {
  listeners.add(listener);
  // emit current immediately
  listener(status);
  return () => listeners.delete(listener);
}

export function getMcpStatus(): McpStatus {
  return status;
}

// Kick off initial connection attempt in background
if (typeof window !== 'undefined') {
  scheduleReconnect();
}
