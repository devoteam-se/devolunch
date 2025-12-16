// What: New AI route namespace with a search endpoint
// Why: Expose a simple REST bridge to AI-powered (MCP) search for the client

import express from 'express';
import type { Request, Response, Router } from 'express';
import { callSearchDishes, callSuggestMeal } from '../services/mcpClient.js';

const router: Router = express.Router();

router.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.query as string) || '';
  const language = (req.query.language as string) || 'sv';
  const expand = req.query.expand !== 'false';

  if (!query.trim()) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const data = await callSearchDishes({ query, language, expand });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'search_failed' });
  }
});

// What: Suggest endpoint proxying MCP suggest_meal
// Why: Provide a simple REST fallback for clients not using WS MCP
router.get('/suggest', async (req: Request, res: Response) => {
  const query = (req.query.query as string) || '';
  const language = (req.query.language as string) || 'sv';
  const topK = req.query.topK ? parseInt(String(req.query.topK), 10) : undefined;
  const useLLM = req.query.useLLM !== 'false';

  if (!query.trim()) {
    return res.status(400).json({ error: 'query is required' });
  }

  try {
    const data = await callSuggestMeal({ query, language, topK, useLLM });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'suggest_failed' });
  }
});

export default router;
