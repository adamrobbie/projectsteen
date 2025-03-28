export interface BotConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  settings: {
    pollInterval: number;  // in milliseconds
    maxRetries: number;
    retryDelay: number;    // in milliseconds
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

export interface BotStatus {
  id: string;
  status: 'initializing' | 'initialized' | 'running' | 'paused' | 'stopped' | 'error';
  lastPoll: Date;
  nextPoll: Date;
  error?: string;
  metrics: {
    eventsProcessed: number;
    errors: number;
    lastError?: string;
    uptime: number;
  };
}

export interface Bot {
  // Core lifecycle
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  
  // Status and monitoring
  getStatus(): BotStatus;
  getConfig(): BotConfig;
  
  // Event handling
  onError(handler: (error: Error) => void): void;
  onStatusChange(handler: (status: BotStatus) => void): void;
} 