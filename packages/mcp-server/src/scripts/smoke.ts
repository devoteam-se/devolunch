import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  const scrape = {
    date: new Date().toISOString(),
    restaurants: [
      {
        title: 'Testaurant',
        url: 'https://example.com',
        imageUrl: '',
        coordinate: { lat: 0, lon: 0 },
        googleMapsUrl: 'https://maps.example.com',
        dishCollection: [
          {
            language: 'en',
            dishes: [
              { type: 'veg', title: 'Falafel', description: 'Tasty chickpea balls' },
              { type: 'meat', title: 'Chicken Bowl', description: 'Grilled chicken with rice' },
            ],
          },
        ],
      },
    ],
  };

  const dataUrl = `data:application/json,${encodeURIComponent(JSON.stringify(scrape))}`;

  const client = new Client({ name: 'smoke-client', version: '0.0.0' }, { capabilities: {} });
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/mcp-server/src/index.js'],
    env: { ...process.env, MCP_SCRAPE_URL: dataUrl, NODE_NO_WARNINGS: '1' },
  });

  await client.connect(transport);

  const list = await client.listTools();
  console.log('Tools:', list.tools.map((t) => t.name));

  const getRes = await client.callTool({ name: 'get_restaurants', arguments: {} });
  console.log('get_restaurants ->', JSON.stringify(getRes, null, 2).slice(0, 200) + '...');

  const search = await client.callTool({ name: 'search_dishes', arguments: { query: 'chicken', language: 'en' } });
  console.log('search_dishes(chicken) ->', JSON.stringify(search, null, 2).slice(0, 200) + '...');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
