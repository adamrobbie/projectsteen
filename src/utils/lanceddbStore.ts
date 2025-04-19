import { connect } from 'lancedb';
import { OpenAIEmbeddings } from '@langchain/openai';
import { lancedbConfig } from '../config/lanceddb.config.js';
import { Conversation, ConversationContext } from '../types/conversation.js';

export class LanceDBConversationStore {
  private db: any;
  private table: any;
  private embeddings: OpenAIEmbeddings;
  private tableName: string;
  private dataPath: string;

  constructor() {
    this.tableName = lancedbConfig.tableName;
    this.dataPath = lancedbConfig.dataPath;
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: lancedbConfig.openAIApiKey,
      modelName: lancedbConfig.embeddingModel,
    });
  }

  async initialize(): Promise<void> {
    this.db = await connect(this.dataPath);
    
    // Check if table exists
    const tables = await this.db.tableNames();
    if (!tables.includes(this.tableName)) {
      // Create table with schema
      this.table = await this.db.createTable(this.tableName, [{
        id: '',
        messages: [],
        context: {},
        embedding: new Array(lancedbConfig.vectorDimension).fill(0),
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    } else {
      this.table = await this.db.openTable(this.tableName);
    }
  }

  async storeConversation(conversation: Conversation, context: ConversationContext): Promise<string> {
    const embedding = await this.generateEmbedding(conversation, context);
    
    const record = {
      id: conversation.id,
      messages: conversation.messages,
      context,
      embedding,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.table.add([record]);
    return conversation.id;
  }

  async findSimilarConversations(query: string, limit: number = lancedbConfig.maxSearchResults): Promise<Conversation[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    
    const results = await this.table.search(queryEmbedding)
      .limit(limit)
      .execute();

    return results.map((result: any) => ({
      id: result.id,
      messages: result.messages,
      context: result.context
    }));
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const result = await this.table.search().where(`id = '${id}'`).execute();
    if (result.length === 0) return null;
    
    return {
      id: result[0].id,
      messages: result[0].messages,
      context: result[0].context
    };
  }

  async updateConversation(id: string, messages: any[], context: ConversationContext): Promise<void> {
    const embedding = await this.generateEmbedding({ id, messages }, context);
    
    await this.table.update()
      .where(`id = '${id}'`)
      .set({
        messages,
        context,
        embedding,
        updatedAt: new Date()
      })
      .execute();
  }

  async deleteConversation(id: string): Promise<void> {
    await this.table.delete().where(`id = '${id}'`).execute();
  }

  private async generateEmbedding(conversation: Conversation, context: ConversationContext): Promise<number[]> {
    const text = this.formatConversationForEmbedding(conversation, context);
    return await this.embeddings.embedQuery(text);
  }

  private formatConversationForEmbedding(conversation: Conversation, context: ConversationContext): string {
    const messagesText = conversation.messages
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n');
    
    const contextText = JSON.stringify(context);
    
    return `${messagesText}\nContext: ${contextText}`;
  }
} 