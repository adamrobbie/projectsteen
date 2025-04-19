import { connect } from "lancedb";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Conversation, Message, ScrumContext, ConversationSearchResult } from "../models/types";

export class LanceDBConversationStore {
  private db: any;
  private table: any;
  private embeddings: OpenAIEmbeddings;
  private tableName: string;
  private dataPath: string;

  constructor(
    dataPath: string,
    tableName: string,
    openAIApiKey: string
  ) {
    this.dataPath = dataPath;
    this.tableName = tableName;
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey,
      modelName: "text-embedding-3-small"
    });
  }

  async initialize(): Promise<void> {
    try {
      // Connect to LanceDB
      this.db = await connect(this.dataPath);

      // Create or get the table
      const tableExists = await this.db.tableNames().then((names: string[]) => 
        names.includes(this.tableName)
      );

      if (!tableExists) {
        // Create table with schema
        this.table = await this.db.createTable(this.tableName, [{
          id: "",
          messages: [],
          context: {},
          embedding: new Array(1536).fill(0), // OpenAI embedding dimension
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }], {
          schema: {
            id: "string",
            messages: "array",
            context: "object",
            embedding: "vector",
            createdAt: "string",
            updatedAt: "string"
          }
        });
      } else {
        this.table = await this.db.openTable(this.tableName);
      }

      console.log("LanceDB store initialized successfully");
    } catch (error) {
      console.error("Failed to initialize LanceDB store:", error);
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
      const record = {
        id,
        messages,
        context,
        embedding,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Upsert the record
      await this.table.add([record]);
      console.log(`Stored conversation ${id}`);
    } catch (error) {
      console.error("Failed to store conversation:", error);
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
      const results = await this.table.search(queryEmbedding)
        .limit(limit)
        .select(["id", "messages", "context", "createdAt"])
        .execute();

      // Format results
      return results.map((result: any) => ({
        id: result.id,
        similarity: result.score,
        messages: result.messages,
        context: result.context,
        createdAt: result.createdAt
      }));
    } catch (error) {
      console.error("Failed to find similar conversations:", error);
      throw error;
    }
  }

  async getConversation(id: string): Promise<Conversation | null> {
    try {
      const result = await this.table.search()
        .where(`id = '${id}'`)
        .limit(1)
        .execute();

      if (result.length === 0) {
        return null;
      }

      return {
        id: result[0].id,
        messages: result[0].messages,
        context: result[0].context,
        createdAt: result[0].createdAt,
        updatedAt: result[0].updatedAt
      };
    } catch (error) {
      console.error("Failed to get conversation:", error);
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
      await this.table.update({
        where: `id = '${id}'`,
        values: {
          messages,
          context,
          embedding,
          updatedAt: new Date().toISOString()
        }
      });

      console.log(`Updated conversation ${id}`);
    } catch (error) {
      console.error("Failed to update conversation:", error);
      throw error;
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await this.table.delete(`id = '${id}'`);
      console.log(`Deleted conversation ${id}`);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
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
      .join("\n");

    const contextText = `
      Sprint: ${context.sprintName}
      Team: ${context.teamMembers.join(", ")}
      ${context.previousMeetingNotes ? `Previous Notes: ${context.previousMeetingNotes}` : ""}
    `;

    return `${contextText}\n\nConversation:\n${messageText}`;
  }
} 