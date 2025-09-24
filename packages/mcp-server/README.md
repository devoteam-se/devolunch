@devolunch/mcp-server
=================================

Minimal MCP server exposing tools for DevoLunch data:

- get_restaurants: returns current scrape (via `MCP_SCRAPE_URL` or default `http://localhost:8080/api/v1/restaurants`).
- search_dishes: searches dishes across restaurants, optional `language` filter.
- suggest_meal: ranks and suggests top dishes with reasons; can optionally use OpenAI if `OPENAI_API_KEY` is set.

Scripts
- build: `pnpm -F @devolunch/mcp-server build`
- start: `MCP_SCRAPE_URL=http://localhost:8080/api/v1/restaurants pnpm -F @devolunch/mcp-server start`

Notes
- Runs over stdio (MCP). Use an MCP-compatible client to connect.
- Later we can factor data access to a shared module to remove the HTTP hop.
- If `OPENAI_API_KEY` is available, the server uses it to expand queries and improve suggestions. Otherwise it falls back to curated synonyms.
