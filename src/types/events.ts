export enum EventSource {
  GITHUB = 'github',
  JIRA = 'jira',
  SYSTEM = 'system',
  USER = 'user'
}

export enum EventType {
  // Task Events
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_COMPLETED = 'task.completed',
  TASK_BLOCKED = 'task.blocked',
  
  // Sprint Events
  SPRINT_STARTED = 'sprint.started',
  SPRINT_ENDED = 'sprint.ended',
  SPRINT_BLOCKED = 'sprint.blocked',
  SPRINT_METRICS_UPDATED = 'sprint.metrics.updated',
  
  // Team Events
  TEAM_MEMBER_AVAILABILITY = 'team.member.availability',
  WORKLOAD_CHANGED = 'workload.changed',
  BLOCKERS_IDENTIFIED = 'blockers.identified',
  
  // Integration Events
  SERVICE_CONNECTION_STATUS = 'service.connection.status',
  SYNC_STATUS = 'sync.status',
  ERROR = 'error',
  INTEGRATION_EVENT = 'integration.event'
}

export interface BaseEvent {
  id: string;
  timestamp: Date;
  source: EventSource;
  type: EventType;
  payload: any;
  metadata: {
    correlationId?: string;
    userId?: string;
    priority?: number;
    retryCount?: number;
  };
}

export interface EventHandler {
  handle(event: BaseEvent): Promise<void>;
}

export interface EventProcessor {
  process(event: BaseEvent): Promise<void>;
}

export interface EventRouter {
  route(event: BaseEvent): Promise<void>;
}

export interface EventStore {
  save(event: BaseEvent): Promise<void>;
  get(id: string): Promise<BaseEvent>;
  query(filter: any): Promise<BaseEvent[]>;
} 