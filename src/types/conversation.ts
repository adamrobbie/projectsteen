export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  messages: Message[];
  metadata: {
    title?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
  };
  embedding?: number[];
} 