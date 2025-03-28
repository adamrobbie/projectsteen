import { BaseEvent, EventStore } from '../../types/events';

export class MockEventStore implements EventStore {
  private events: Map<string, BaseEvent>;

  constructor() {
    this.events = new Map();
  }

  async save(event: BaseEvent): Promise<void> {
    this.events.set(event.id, event);
  }

  async get(id: string): Promise<BaseEvent> {
    const event = this.events.get(id);
    if (!event) {
      throw new Error(`Event with id ${id} not found`);
    }
    return event;
  }

  async query(filter: any): Promise<BaseEvent[]> {
    // Simple implementation that returns all events
    return Array.from(this.events.values());
  }

  clear(): void {
    this.events.clear();
  }
} 