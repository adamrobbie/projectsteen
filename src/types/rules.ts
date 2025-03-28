import { BaseEvent } from './events';

export interface RuleCondition {
  type: string;
  parameters: Record<string, any>;
  evaluate(event: BaseEvent): boolean;
}

export interface RuleAction {
  type: string;
  parameters: Record<string, any>;
  execute(event: BaseEvent): Promise<void>;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
  metadata: {
    created: Date;
    updated: Date;
    createdBy: string;
    tags?: string[];
  };
}

export interface RuleEngine {
  addRule(rule: Rule): Promise<void>;
  removeRule(ruleId: string): Promise<void>;
  updateRule(rule: Rule): Promise<void>;
  getRule(ruleId: string): Promise<Rule>;
  getRules(): Promise<Rule[]>;
  evaluateEvent(event: BaseEvent): Promise<void>;
  enableRule(ruleId: string): Promise<void>;
  disableRule(ruleId: string): Promise<void>;
}

export interface RuleStore {
  save(rule: Rule): Promise<void>;
  get(ruleId: string): Promise<Rule>;
  getAll(): Promise<Rule[]>;
  delete(ruleId: string): Promise<void>;
}

// Built-in condition types
export enum ConditionType {
  EVENT_TYPE = 'event.type',
  EVENT_SOURCE = 'event.source',
  PAYLOAD_MATCH = 'payload.match',
  METADATA_MATCH = 'metadata.match',
  TIME_BASED = 'time.based',
  CUSTOM = 'custom'
}

// Built-in action types
export enum ActionType {
  UPDATE_TASK = 'update.task',
  SEND_NOTIFICATION = 'send.notification',
  CREATE_TASK = 'create.task',
  UPDATE_SPRINT = 'update.sprint',
  CUSTOM = 'custom'
}

// Example of a condition implementation
export class EventTypeCondition implements RuleCondition {
  type = ConditionType.EVENT_TYPE;
  parameters: { eventType: string };

  constructor(eventType: string) {
    this.parameters = { eventType };
  }

  evaluate(event: BaseEvent): boolean {
    return event.type === this.parameters.eventType;
  }
}

// Example of an action implementation
export class SendNotificationAction implements RuleAction {
  type = ActionType.SEND_NOTIFICATION;
  parameters: { message: string; channel: string };

  constructor(message: string, channel: string) {
    this.parameters = { message, channel };
  }

  async execute(event: BaseEvent): Promise<void> {
    // Implementation would go here
    console.log(`Sending notification: ${this.parameters.message}`);
  }
} 