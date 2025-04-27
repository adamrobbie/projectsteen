import { MilvusClient } from '@zilliz/milvus2-sdk-node';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Conversation, Message, ScrumContext, ConversationSearchResult } from '../models/types';

export class MilvusConversationStore {
  private client: MilvusClient;
  private embeddings: OpenAIEmbeddings;
  private collectionName: string;
  private dimension: number = 1536; // OpenAI embedding dimension

  constructor(
    milvusUrl: string = 'localhost:19530',
    collectionName: string = 'conversations',
    openAIApiKey: string
  ) {
    this.collectionName = collectionName;
    this.client = new MilvusClient({
      address: milvusUrl,
    });
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey,
      modelName: 'text-embedding-3-small'
    });
  }

  async initialize(): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.listCollections();
      const collectionExists = collections.data.some(col => col.name === this.collectionName);

      if (!collectionExists) {
        // Create collection with schema
        await this.client.createCollection({
          collection_name: this.collectionName,
          fields: [
            {
              name: 'id',
              data_type: 'VarChar',
              is_primary_key: true,
              max_length: 100
            },
            {
              name: 'messages',
              data_type: 'JSON'
            },
            {
              name: 'context',
              data_type: 'JSON'
            },
            {
              name: 'embedding',
              data_type: 'FloatVector',
              dim: this.dimension
            },
            {
              name: 'createdAt',
              data_type: 'VarChar',
              max_length: 30
            },
            {
              name: 'updatedAt',
              data_type: 'VarChar',
              max_length: 30
            }
          ]
        });

        // Create index for vector search
        await this.client.createIndex({
          collection_name: this.collectionName,
          field_name: 'embedding',
          index_type: 'IVF_FLAT',
          metric_type: 'L2',
          params: { nlist: 1024 }
        });

        // Load collection into memory
        await this.client.loadCollection({
          collection_name: this.collectionName
        });
      }

      console.log('Milvus store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Milvus store:', error);
      throw error;
    }
  }

  async storeConversation(
    id: string,
    messages: Message[],
    context: ScrumContext
  ): Promise<void> {
    try {
      // Generate embedding for the conversation
      const conversationText = this.formatConversationForEmbedding(messages, context);
      const embedding = await this.embeddings.embedQuery(conversationText);

      // Prepare the record
      const now = new Date().toISOString();
      const data = {
        id,
        messages: JSON.stringify(messages),
        context: JSON.stringify(context),
        embedding,
        createdAt: now,
        updatedAt: now
      };

      // Insert the record
      await this.client.insert({
        collection_name: this.collectionName,
        data: [data]
      });

      console.log(`Stored conversation ${id}`);
    } catch (error) {
      console.error('Failed to store conversation:', error);
      throw error;
    }
  }

  async findSimilarConversations(
    query: string,
    teamId?: string,
    limit: number = 3
  ): Promise<ConversationSearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Search for similar conversations
      const searchResults = await this.client.search({
        collection_name: this.collectionName,
        vector: queryEmbedding,
        limit,
        output_fields: ['id', 'messages', 'context', 'createdAt']
      });

      // Format results
      return searchResults.results.map((result: any) => ({
        id: result.id,
        similarity: result.score,
        messages: JSON.parse(result.messages),
        context: JSON.parse(result.context),
        createdAt: result.createdAt
      }));
    } catch (error) {
      console.error('Failed to find similar conversations:', error);
      throw error;
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    try {
      const result = await this.client.query({
        collection_name: this.collectionName,
        filter: `id == "${id}"`,
        output_fields: ['id', 'messages', 'context', 'createdAt', 'updatedAt']
      });

      if (result.data.length === 0) {
        return null;
      }

      const conversation = result.data[0];
      return {
        id: conversation.id,
        messages: JSON.parse(conversation.messages),
        context: JSON.parse(conversation.context),
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      };
    } catch (error) {
      console.error('Failed to get conversation:', error);
      throw error;
    }
  }

  async updateConversation(
    id: string,
    messages: Message[],
    context: ScrumContext
  ): Promise<void> {
    try {
      // Generate new embedding
      const conversationText = this.formatConversationForEmbedding(messages, context);
      const embedding = await this.embeddings.embedQuery(conversationText);

      // Update the record
      await this.client.delete({
        collection_name: this.collectionName,
        filter: `id == "${id}"`
      });

      // Re-insert with updated data
      const now = new Date().toISOString();
      const data = {
        id,
        messages: JSON.stringify(messages),
        context: JSON.stringify(context),
        embedding,
        createdAt: now,
        updatedAt: now
      };

      await this.client.insert({
        collection_name: this.collectionName,
        data: [data]
      });

      console.log(`Updated conversation ${id}`);
    } catch (error) {
      console.error('Failed to update conversation:', error);
      throw error;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await this.client.delete({
        collection_name: this.collectionName,
        filter: `id == "${id}"`
      });
      console.log(`Deleted conversation ${id}`);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw error;
    }
  }

  private formatConversationForEmbedding(
    messages: Message[],
    context: ScrumContext
  ): string {
    // Format the conversation in a way that captures its semantic meaning
    const messageText = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const contextText = `
      Sprint: ${context.sprintName}
      Team: ${context.teamMembers.join(', ')}
      ${context.previousMeetingNotes ? `Previous Notes: ${context.previousMeetingNotes}` : ''}
    `;

    return `${contextText}\n\nConversation:\n${messageText}`;
  }
} 