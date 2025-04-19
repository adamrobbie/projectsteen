import path from 'path';

export const lancedbConfig = {
  dataPath: process.env.LANCEDB_DATA_PATH || path.join(process.cwd(), 'data', 'lancedb'),
  tableName: process.env.LANCEDB_TABLE_NAME || 'conversations',
  openAIApiKey: process.env.OPENAI_API_KEY || '',
  embeddingModel: 'text-embedding-3-small',
  maxSearchResults: 3,
  vectorDimension: 1536, // OpenAI embedding dimension
}; 