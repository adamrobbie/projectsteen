import { Bot, BotConfig, BotStatus } from '../types/bot.js';
import { BaseEvent, EventSource, EventType } from '../types/events.js';

export class SteenBot implements Bot {
  private config: BotConfig;
  private status: BotStatus;
  private pollInterval: NodeJS.Timeout | null;
  private errorHandlers: ((error: Error) => void)[];
  private statusChangeHandlers: ((status: BotStatus) => void)[];
  private startTime: Date;
  private isInitialized: boolean;

  constructor(config: BotConfig) {
    this.config = config;
    this.errorHandlers = [];
    this.statusChangeHandlers = [];
    this.startTime = new Date();
    this.isInitialized = false;
    
    this.status = {
      id: config.id,
      status: 'initializing',
      lastPoll: new Date(),
      nextPoll: new Date(),
      metrics: {
        eventsProcessed: 0,
        errors: 0,
        uptime: 0
      }
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.updateStatus('initializing');
      this.isInitialized = true;
      this.updateStatus('initialized');
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      this.updateStatus('error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.status.status === 'running') {
      return;
    }

    try {
      this.updateStatus('running');
      this.startPolling();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      this.updateStatus('error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.status.status === 'stopped') {
      return;
    }

    try {
      this.stopPolling();
      this.updateStatus('stopped');
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      this.updateStatus('error', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (this.status.status === 'paused') {
      return;
    }

    this.stopPolling();
    this.updateStatus('paused');
  }

  async resume(): Promise<void> {
    if (this.status.status !== 'paused') {
      return;
    }

    this.startPolling();
    this.updateStatus('running');
  }

  getStatus(): BotStatus {
    return {
      ...this.status,
      metrics: {
        ...this.status.metrics,
        uptime: Date.now() - this.startTime.getTime()
      }
    };
  }

  getConfig(): BotConfig {
    return this.config;
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  onStatusChange(handler: (status: BotStatus) => void): void {
    this.statusChangeHandlers.push(handler);
  }

  private startPolling(): void {
    if (this.pollInterval) {
      return;
    }

    this.pollInterval = setInterval(
      () => this.poll(),
      this.config.settings.pollInterval
    );
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private async poll(): Promise<void> {
    try {
      this.status.lastPoll = new Date();
      this.status.nextPoll = new Date(Date.now() + this.config.settings.pollInterval);

      // For now, just emit a system event
      const event: BaseEvent = {
        id: `poll-${Date.now()}`,
        timestamp: new Date(),
        source: EventSource.SYSTEM,
        type: EventType.INTEGRATION_EVENT,
        payload: {
          message: 'Bot is running and polling'
        },
        metadata: {}
      };

      // TODO: Process the event
      console.log('Bot poll event:', event);

      this.status.metrics.eventsProcessed++;
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private handleError(error: Error): void {
    this.status.metrics.errors++;
    this.status.metrics.lastError = error.message;
    this.status.error = error.message;
    
    // Notify error handlers
    this.errorHandlers.forEach(handler => handler(error));
  }

  private updateStatus(status: BotStatus['status'], error?: string): void {
    const oldStatus = this.status.status;
    this.status.status = status;
    this.status.error = error;

    // Notify status change handlers if status has changed
    if (oldStatus !== status) {
      this.statusChangeHandlers.forEach(handler => handler(this.getStatus()));
    }
  }
} 