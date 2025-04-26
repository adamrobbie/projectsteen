// src/agents/gemmaAgent.ts

import { Ollama } from "@langchain/ollama";
import { AgentExecutor } from "langchain/agents";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { DynamicTool } from "@langchain/core/tools";
import { ScrumContext, UserStory, Message } from "../models/types";
import { MilvusConversationStore } from "../utils/milvusStore";
import { BaseMemory } from "langchain/memory";
import { ChatPromptTemplate } from "langchain/prompts";

/**
 * A tool that retrieves previous sprint information
 */
const getSprintHistoryTool = new DynamicTool({
  name: "get_sprint_history",
  description: "Retrieve historical information about previous sprints",
  func: async (input: string) => {
    const params = JSON.parse(input);
    const { sprintName, teamId } = params;
    // This could query a database of previous sprints
    return `Sprint history for ${sprintName} (Team: ${teamId || 'Unknown'}):
- Velocity: 35 story points
- Completion rate: 82%
- Carry-over stories: 3
- Top impediment: API integration delays`;
  }
});

/**
 * A tool that retrieves team member information
 */
const getTeamMemberInfoTool = new DynamicTool({
  name: "get_team_member_info",
  description: "Get information about a specific team member",
  func: async (input: string) => {
    const params = JSON.parse(input);
    const { memberName } = params;
    // This could be connected to a team member database
    const teamInfo: Record<string, { role: string; skills: string[]; workingOn: string }> = {
      "Alice": {
        role: "Frontend Developer",
        skills: ["React", "TypeScript", "CSS"],
        workingOn: "Dashboard UI"
      },
      "Bob": {
        role: "Backend Developer",
        skills: ["Node.js", "Python", "AWS"],
        workingOn: "API Integration"
      },
      "Charlie": {
        role: "DevOps Engineer",
        skills: ["Docker", "Kubernetes", "CI/CD"],
        workingOn: "Infrastructure Setup"
      },
      "Diana": {
        role: "QA Engineer",
        skills: ["Testing", "Automation", "Selenium"],
        workingOn: "Test Automation"
      }
    };
    
    return teamInfo[memberName] 
      ? JSON.stringify(teamInfo[memberName], null, 2)
      : `No information found for team member: ${memberName}`;
  }
});

/**
 * A tool that analyzes user stories
 */
const analyzeUserStoryTool = new DynamicTool({
  name: "analyze_user_story",
  description: "Analyze a user story for quality and completeness",
  func: async (input: string) => {
    const params = JSON.parse(input);
    const { storyId, storyText } = params;
    // This could use a more sophisticated analysis in the future
    const patterns = {
      userRole: /as a (.*?)(?:,|$)/i,
      action: /i want to (.*?)(?:,|$)/i,
      benefit: /so that (.*?)(?:,|$)/i
    };
    
    const analysis = {
      userRole: storyText.match(patterns.userRole)?.[1] || "Unknown",
      action: storyText.match(patterns.action)?.[1] || "Unknown",
      benefit: storyText.match(patterns.benefit)?.[1] || "Unknown",
      quality: "Good",
      suggestions: []
    };
    
    return JSON.stringify({
      storyId,
      analysis
    });
  }
});

/**
 * A tool that retrieves similar conversations from history
 */
const getSimilarConversationsTool = new DynamicTool({
  name: "get_similar_conversations",
  description: "Retrieve similar conversations from history based on a query",
  func: async (input: string) => {
    const params = JSON.parse(input);
    const { query, teamId, limit } = params;
    // This would be connected to your Milvus store
    const conversationStore = new MilvusConversationStore(
      process.env.MILVUS_URL || "http://localhost:19530",
      "conversations",
      process.env.OPENAI_API_KEY || ""
    );
    
    await conversationStore.initialize();
    
    const similarConversations = await conversationStore.findSimilarConversations(
      query,
      teamId,
      limit || 5
    );
    
    return JSON.stringify(similarConversations, null, 2);
  }
});

/**
 * A tool that estimates story points for a user story
 */
const estimateStoryPointsTool = new DynamicTool({
  name: "estimate_story_points",
  description: "Estimate story points for a user story based on complexity",
  func: async (input: string) => {
    const params = JSON.parse(input);
    const { storyId, storyText } = params;
    // Simple heuristic based on word count and complexity indicators
    const wordCount = storyText.split(/\s+/).length;
    const complexityIndicators = [
      "complex", "difficult", "challenging", "integration",
      "database", "security", "performance", "scalability"
    ];
    
    const foundIndicators = complexityIndicators.filter(indicator => 
      storyText.toLowerCase().includes(indicator)
    );
    
    // Simple scoring algorithm
    let points = Math.ceil(wordCount / 50); // Base points on word count
    points += foundIndicators.length * 2;   // Add points for complexity indicators
    
    // Cap at 13 points (Fibonacci sequence max)
    points = Math.min(points, 13);
    
    return JSON.stringify({
      storyId,
      storyPoints: points,
      confidenceLevel: foundIndicators.length > 2 ? "High" : "Medium",
      factors: {
        wordCount,
        complexityIndicators: foundIndicators
      }
    });
  }
});

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ScrumContext {
  messages: Message[];
  sprintName?: string;
  teamMembers?: string[];
  userStories?: string[];
  previousMeetingNotes?: string;
}

/**
 * Class that implements a Scrum Master agent using Gemma 2 via Ollama
 */
export class GemmaScrumMasterAgent {
  private model: Ollama;
  private executor!: AgentExecutor;
  private memory: BaseMemory;
  private conversationStore: MilvusConversationStore;

  constructor(
    private context: ScrumContext,
    private teamId: string
  ) {
    this.model = new Ollama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: "gemma:7b"
    });
    
    this.memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true
    });
    
    this.conversationStore = new MilvusConversationStore(
      process.env.MILVUS_URL || "http://localhost:19530",
      "conversations",
      process.env.OPENAI_API_KEY || ""
    );
    
    this.initializeAgent();
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async initializeAgent() {
    const tools = [
      getSprintHistoryTool,
      getTeamMemberInfoTool,
      analyzeUserStoryTool,
      getSimilarConversationsTool,
      estimateStoryPointsTool
    ];

    const agent = await createReactAgent({
      llm: this.model,
      tools,
      prompt: ChatPromptTemplate.fromMessages([
        ["system", `You are an AI Scrum Master assistant for team ${this.teamId}.
Your role is to help manage the sprint, track progress, and assist with agile processes.
Use the available tools to help with sprint planning, story analysis, and team coordination.`],
        ["human", "{input}"],
        ["ai", "{agent_scratchpad}"]
      ])
    });

    this.executor = new AgentExecutor({
      agent,
      tools,
      memory: this.memory,
      verbose: true
    });
  }

  async processMessage(message: Message): Promise<Message> {
    const response = await this.executor.invoke({
      input: message.content,
      chat_history: this.context.messages
    });

    const responseMessage: Message = {
      id: this.generateId(),
      role: "assistant",
      content: response.output,
      timestamp: new Date().toISOString()
    };

    // Store the conversation
    await this.conversationStore.storeConversation(
      this.teamId,
      [message, responseMessage],
      this.context
    );

    return responseMessage;
  }
}