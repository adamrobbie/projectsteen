export const lancedbConfig = {
  tableName: 'conversations',
  dataPath: './data/lancedb',
  openAIApiKey: process.env.OPENAI_API_KEY || '',
  embeddingModel: 'text-embedding-3-small',
  maxResults: 5,
  similarityThreshold: 0.8
}; 