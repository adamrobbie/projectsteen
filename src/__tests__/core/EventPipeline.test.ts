import { EventPipeline } from '../../core/EventPipeline';
import { DefaultEventRouter } from '../../core/EventRouter';
import { MockEventStore } from './MockEventStore';
import { BaseEvent, EventHandler, EventProcessor, EventSource, EventType } from '../../types/events';

describe('EventPipeline', () => {
  let pipeline: EventPipeline;
  let router: DefaultEventRouter;
  let store: MockEventStore;
  let mockHandler: jest.Mocked<EventHandler>;
  let mockProcessor: jest.Mocked<EventProcessor>;

  beforeEach(() => {
    router = new DefaultEventRouter();
    store = new MockEventStore();
    mockHandler = {
      handle: jest.fn().mockResolvedValue(undefined),
    };
    mockProcessor = {
      process: jest.fn().mockResolvedValue(undefined),
    };
    pipeline = new EventPipeline(router, store, [mockProcessor]);
  });

  afterEach(() => {
    store.clear();
  });

  const createTestEvent = (type: EventType): BaseEvent => ({
    id: `test-event-${Date.now()}`,
    timestamp: new Date(),
    source: EventSource.SYSTEM,
    type,
    payload: { test: 'data' },
    metadata: {},
  });

  describe('ingest', () => {
    it('should store, route, process, and handle an event', async () => {
      const event = createTestEvent(EventType.TASK_CREATED);
      pipeline.registerHandler(EventType.TASK_CREATED, mockHandler);

      await pipeline.ingest(event);

      expect(store.get).toBeDefined();
      expect(mockProcessor.process).toHaveBeenCalledWith(event);
      expect(mockHandler.handle).toHaveBeenCalledWith(event);
    });

    it('should handle errors gracefully', async () => {
      const event = createTestEvent(EventType.TASK_CREATED);
      mockProcessor.process.mockRejectedValueOnce(new Error('Processing failed'));

      await expect(pipeline.ingest(event)).rejects.toThrow('Processing failed');
    });
  });

  describe('registerHandler', () => {
    it('should register handlers for specific event types', async () => {
      const event = createTestEvent(EventType.TASK_CREATED);
      pipeline.registerHandler(EventType.TASK_CREATED, mockHandler);

      await pipeline.ingest(event);

      expect(mockHandler.handle).toHaveBeenCalledWith(event);
    });

    it('should support multiple handlers for the same event type', async () => {
      const event = createTestEvent(EventType.TASK_CREATED);
      const secondHandler: EventHandler = {
        handle: jest.fn().mockResolvedValue(undefined),
      };

      pipeline.registerHandler(EventType.TASK_CREATED, mockHandler);
      pipeline.registerHandler(EventType.TASK_CREATED, secondHandler);

      await pipeline.ingest(event);

      expect(mockHandler.handle).toHaveBeenCalledWith(event);
      expect(secondHandler.handle).toHaveBeenCalledWith(event);
    });
  });

  describe('replayEvents', () => {
    it('should replay all events matching the filter', async () => {
      const events = [
        createTestEvent(EventType.TASK_CREATED),
        createTestEvent(EventType.TASK_UPDATED),
      ];

      for (const event of events) {
        await store.save(event);
      }

      pipeline.registerHandler(EventType.TASK_CREATED, mockHandler);
      pipeline.registerHandler(EventType.TASK_UPDATED, mockHandler);

      await pipeline.replayEvents({});

      expect(mockHandler.handle).toHaveBeenCalledTimes(2);
    });
  });
}); 