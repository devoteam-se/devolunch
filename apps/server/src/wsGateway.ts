// What: WebSocket MCP gateway
// Why: Allow browser to connect via MCP over WebSocket instead of REST

import type { Server as HttpServer } from 'http';
import { WebSocketServer } from 'ws';
import type { WebSocket, RawData } from 'ws';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  ListToolsResultSchema,
  CallToolRequestSchema,
  CallToolResultSchema,
  type JSONRPCMessage,
} from '@modelcontextprotocol/sdk/types.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { mcpListTools, mcpCallTool } from './services/mcpClient.js';

class WsServerTransport implements Transport {
  private ws: WebSocket;
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  constructor(ws: WebSocket) {
    this.ws = ws;
  }

  async start(): Promise<void> {
    this.ws.on('message', (data: RawData) => {
      try {
        const msg = JSON.parse(data.toString());
        this.onmessage?.(msg);
      } catch (err) {
        this.onerror?.(err as Error);
      }
    });
    this.ws.on('close', () => this.onclose?.());
    this.ws.on('error', (err: Error) => this.onerror?.(err));
  }

  async send(message: JSONRPCMessage): Promise<void> {
    this.ws.send(JSON.stringify(message));
  }

  async close(): Promise<void> {
    this.ws.close();
    this.onclose?.();
  }
}

export function setupWsGateway(server: HttpServer) {
  const wss = new WebSocketServer({
    server,
    path: '/mcp',
    handleProtocols: (protocols: Set<string>): string | false => {
      if (protocols.has('mcp')) return 'mcp';
      return false; // reject if MCP not requested
    },
  });

  wss.on('connection', async (socket: WebSocket) => {
    const transport = new WsServerTransport(socket);
    const mcpServer = new Server(
      { name: '@devolunch/mcp-gateway', version: '0.1.0' },
      { capabilities: { tools: {} } },
    );

    // tools/list -> forward from child MCP
    mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      const list = await mcpListTools();
      return { tools: list.tools } as unknown as typeof ListToolsResultSchema._type;
    });

    // tools/call -> forward directly
    mcpServer.setRequestHandler(CallToolRequestSchema, async (req) => {
      const result = await mcpCallTool(req.params);
      return result as unknown as typeof CallToolResultSchema._type;
    });

    await mcpServer.connect(transport);
  });
}
