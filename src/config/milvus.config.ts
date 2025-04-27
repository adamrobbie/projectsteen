export const milvusConfig = {
  url: process.env.MILVUS_URL || 'localhost:19530',
  collectionName: process.env.MILVUS_COLLECTION_NAME || 'conversations',
  openAIApiKey: process.env.OPENAI_API_KEY || '',
  embeddingModel: 'text-embedding-3-small',
  maxSearchResults: 3,
  vectorDimension: 1536, // OpenAI embedding dimension
}; 