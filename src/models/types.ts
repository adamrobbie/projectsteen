export interface UserStory {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assignee?: string;
  storyPoints?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  workingOn?: string;
  availability?: number; // 0-100%
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  teamId: string;
  velocity?: number;
  completionRate?: number;
  carryOverStories?: number;
  impediments?: string[];
}

export interface Conversation {
  id: string;
  messages: Message[];
  context: ScrumContext;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ScrumContext {
  sprintName: string;
  teamMembers: string[];
  userStories?: UserStory[];
  previousMeetingNotes?: string;
  teamId?: string;
  sprintId?: string;
}

export interface ConversationSearchResult {
  id: string;
  similarity: number;
  messages: Message[];
  context: ScrumContext;
  createdAt: string;
} 