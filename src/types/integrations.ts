import { BaseEvent } from './events';

export interface IntegrationConfig {
  id: string;
  type: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  enabled: boolean;
}

export interface IntegrationAdapter {
  id: string;
  type: string;
  version: string;
  config: IntegrationConfig;
  
  // Core integration lifecycle
  initialize(): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  validate(): Promise<boolean>;
  
  // Event handling
  subscribe(handler: (event: BaseEvent) => Promise<void>): Promise<void>;
  unsubscribe(): Promise<void>;
  
  // Event publishing
  publish(event: BaseEvent): Promise<void>;
  
  // Integration-specific operations
  getCapabilities(): IntegrationCapability[];
  supportsOperation(operation: string): boolean;
  executeOperation(operation: string, params: any): Promise<any>;
}

export interface IntegrationCapability {
  name: string;
  description: string;
  operations: string[];
  events: string[];
}

export interface IntegrationRegistry {
  registerAdapter(adapter: IntegrationAdapter): Promise<void>;
  unregisterAdapter(adapterId: string): Promise<void>;
  getAdapter(adapterId: string): IntegrationAdapter;
  getAdapters(): IntegrationAdapter[];
  getAdaptersByType(type: string): IntegrationAdapter[];
}

// Example GitHub integration adapter
export class GitHubIntegrationAdapter implements IntegrationAdapter {
  id: string;
  type = 'github';
  version = '1.0.0';
  config: IntegrationConfig;
  private eventHandler?: (event: BaseEvent) => Promise<void>;

  constructor(config: IntegrationConfig) {
    this.id = config.id;
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Initialize GitHub client
  }

  async connect(): Promise<void> {
    // Connect to GitHub
  }

  async disconnect(): Promise<void> {
    // Disconnect from GitHub
  }

  async validate(): Promise<boolean> {
    // Validate GitHub credentials and permissions
    return true;
  }

  async subscribe(handler: (event: BaseEvent) => Promise<void>): Promise<void> {
    this.eventHandler = handler;
    // Set up GitHub webhook handlers
  }

  async unsubscribe(): Promise<void> {
    this.eventHandler = undefined;
    // Clean up GitHub webhook handlers
  }

  async publish(event: BaseEvent): Promise<void> {
    // Publish event to GitHub (e.g., create issue, update PR)
  }

  getCapabilities(): IntegrationCapability[] {
    return [
      {
        name: 'issues',
        description: 'GitHub Issues management',
        operations: ['create', 'update', 'close', 'comment'],
        events: ['issue.created', 'issue.updated', 'issue.closed']
      },
      {
        name: 'pull_requests',
        description: 'GitHub Pull Requests management',
        operations: ['create', 'update', 'merge', 'review'],
        events: ['pr.created', 'pr.updated', 'pr.merged']
      }
    ];
  }

  supportsOperation(operation: string): boolean {
    return this.getCapabilities()
      .some(cap => cap.operations.includes(operation));
  }

  async executeOperation(operation: string, params: any): Promise<any> {
    if (!this.supportsOperation(operation)) {
      throw new Error(`Operation ${operation} not supported`);
    }
    // Execute GitHub-specific operation
    return {};
  }
}

// Example JIRA integration adapter
export class JiraIntegrationAdapter implements IntegrationAdapter {
  id: string;
  type = 'jira';
  version = '1.0.0';
  config: IntegrationConfig;
  private eventHandler?: (event: BaseEvent) => Promise<void>;

  constructor(config: IntegrationConfig) {
    this.id = config.id;
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Initialize JIRA client
  }

  async connect(): Promise<void> {
    // Connect to JIRA
  }

  async disconnect(): Promise<void> {
    // Disconnect from JIRA
  }

  async validate(): Promise<boolean> {
    // Validate JIRA credentials and permissions
    return true;
  }

  async subscribe(handler: (event: BaseEvent) => Promise<void>): Promise<void> {
    this.eventHandler = handler;
    // Set up JIRA webhook handlers
  }

  async unsubscribe(): Promise<void> {
    this.eventHandler = undefined;
    // Clean up JIRA webhook handlers
  }

  async publish(event: BaseEvent): Promise<void> {
    // Publish event to JIRA (e.g., create issue, update status)
  }

  getCapabilities(): IntegrationCapability[] {
    return [
      {
        name: 'issues',
        description: 'JIRA Issues management',
        operations: ['create', 'update', 'transition', 'comment'],
        events: ['issue.created', 'issue.updated', 'issue.transitioned']
      },
      {
        name: 'sprints',
        description: 'JIRA Sprint management',
        operations: ['create', 'update', 'start', 'complete'],
        events: ['sprint.created', 'sprint.updated', 'sprint.started']
      }
    ];
  }

  supportsOperation(operation: string): boolean {
    return this.getCapabilities()
      .some(cap => cap.operations.includes(operation));
  }

  async executeOperation(operation: string, params: any): Promise<any> {
    if (!this.supportsOperation(operation)) {
      throw new Error(`Operation ${operation} not supported`);
    }
    // Execute JIRA-specific operation
    return {};
  }
} 