import { DefaultEventRouter } from '../../core/EventRouter';
import { BaseEvent, EventSource, EventType } from '../../types/events';

describe('DefaultEventRouter', () => {
  let router: DefaultEventRouter;

  beforeEach(() => {
    router = new DefaultEventRouter();
  });

  const createTestEvent = (type: EventType): BaseEvent => ({
    id: `test-event-${Date.now()}`,
    timestamp: new Date(),
    source: EventSource.SYSTEM,
    type,
    payload: { test: 'data' },
    metadata: {},
  });

  describe('route', () => {
    it('should route events to processors in priority order', async () => {
      const event = createTestEvent(EventType.TASK_CREATED);
      
      // Add routes with different priorities
      router.addRoute(EventType.TASK_CREATED, 'low-priority', 1);
      router.addRoute(EventType.TASK_CREATED, 'high-priority', 2);

      // Spy on console.log to verify routing order
      const consoleSpy = jest.spyOn(console, 'log');

      await router.route(event);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy.mock.calls[0][0]).toContain('high-priority');
      expect(consoleSpy.mock.calls[1][0]).toContain('low-priority');

      consoleSpy.mockRestore();
    });

    it('should handle events with no routes', async () => {
      const event = createTestEvent(EventType.TASK_CREATED);
      const consoleSpy = jest.spyOn(console, 'log');

      await router.route(event);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('addRoute', () => {
    it('should add routes for event types', () => {
      router.addRoute(EventType.TASK_CREATED, 'test-processor', 1);
      
      const event = createTestEvent(EventType.TASK_CREATED);
      const consoleSpy = jest.spyOn(console, 'log');

      router.route(event);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('test-processor'));
      consoleSpy.mockRestore();
    });

    it('should support multiple routes for the same event type', () => {
      router.addRoute(EventType.TASK_CREATED, 'processor1', 1);
      router.addRoute(EventType.TASK_CREATED, 'processor2', 2);
      
      const event = createTestEvent(EventType.TASK_CREATED);
      const consoleSpy = jest.spyOn(console, 'log');

      router.route(event);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });
  });

  describe('removeRoute', () => {
    it('should remove routes for event types', () => {
      router.addRoute(EventType.TASK_CREATED, 'test-processor', 1);
      router.removeRoute(EventType.TASK_CREATED, 'test-processor');
      
      const event = createTestEvent(EventType.TASK_CREATED);
      const consoleSpy = jest.spyOn(console, 'log');

      router.route(event);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not affect other routes when removing one route', () => {
      router.addRoute(EventType.TASK_CREATED, 'processor1', 1);
      router.addRoute(EventType.TASK_CREATED, 'processor2', 2);
      router.removeRoute(EventType.TASK_CREATED, 'processor1');
      
      const event = createTestEvent(EventType.TASK_CREATED);
      const consoleSpy = jest.spyOn(console, 'log');

      router.route(event);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('processor2'));
      consoleSpy.mockRestore();
    });
  });
}); 