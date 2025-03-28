import { BaseEvent, EventHandler, EventProcessor, EventRouter, EventStore } from '../types/events';

export class EventPipeline {
  private handlers: Map<string, EventHandler[]>;
  private processors: EventProcessor[];
  private router: EventRouter;
  private store: EventStore;

  constructor(
    router: EventRouter,
    store: EventStore,
    processors: EventProcessor[] = []
  ) {
    this.handlers = new Map();
    this.processors = processors;
    this.router = router;
    this.store = store;
  }

  async ingest(event: BaseEvent): Promise<void> {
    try {
      // Store the event
      await this.store.save(event);

      // Route the event
      await this.router.route(event);

      // Process the event through all processors
      for (const processor of this.processors) {
        await processor.process(event);
      }

      // Handle the event with registered handlers
      const handlers = this.handlers.get(event.type) || [];
      for (const handler of handlers) {
        await handler.handle(event);
      }
    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error);
      throw error;
    }
  }

  registerHandler(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  addProcessor(processor: EventProcessor): void {
    this.processors.push(processor);
  }

  async replayEvents(filter: any): Promise<void> {
    const events = await this.store.query(filter);
    for (const event of events) {
      await this.ingest(event);
    }
  }
} 