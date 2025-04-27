// src/api/gemmaBot.ts

import express from 'express';
import { GemmaScrumMasterAgent } from '../agents/GemmaAgent';

// Initialize Express app
const app = express();

// Initialize the agent with Gemma 2
const scrumBot = new GemmaScrumMasterAgent(
  process.env.OPENAI_API_KEY!,  // Still needed for embeddings
  'http://localhost:11434',     // Ollama URL (default)
  'gemma2:9b',                  // Gemma model
  0.2                           // Temperature (lower = more deterministic)
);

// Initialize the agent
await scrumBot.initialize();

// Now you can use it in your API routes
// Example:
app.post('/api/scrum/chat', async (req, res) => {
  const { query, context, conversationId } = req.body;
  
  const result = await scrumBot.runWithContext(
    query,
    context,
    conversationId
  );
  
  res.json(result);
});