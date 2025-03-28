import { DefaultRuleEngine } from '../../core/RuleEngine';
import { MockRuleStore } from './MockRuleStore';
import { BaseEvent, EventSource, EventType } from '../../types/events';
import { Rule, EventTypeCondition, SendNotificationAction, ConditionType, ActionType } from '../../types/rules';

describe('DefaultRuleEngine', () => {
  let engine: DefaultRuleEngine;
  let store: MockRuleStore;

  beforeEach(() => {
    store = new MockRuleStore();
    engine = new DefaultRuleEngine(store);
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

  const createTestRule = (id: string, priority: number = 1): Rule => ({
    id,
    name: `Test Rule ${id}`,
    description: 'Test rule description',
    priority,
    conditions: [
      new EventTypeCondition(EventType.TASK_CREATED)
    ],
    actions: [
      new SendNotificationAction('Test notification', 'test-channel')
    ],
    enabled: true,
    metadata: {
      created: new Date(),
      updated: new Date(),
      createdBy: 'test-user'
    }
  });

  describe('rule management', () => {
    it('should add and retrieve rules', async () => {
      const rule = createTestRule('test-1');
      await engine.addRule(rule);

      const retrieved = await engine.getRule('test-1');
      expect(retrieved).toEqual(rule);
    });

    it('should update rules', async () => {
      const rule = createTestRule('test-1');
      await engine.addRule(rule);

      rule.name = 'Updated Rule';
      await engine.updateRule(rule);

      const updated = await engine.getRule('test-1');
      expect(updated.name).toBe('Updated Rule');
    });

    it('should remove rules', async () => {
      const rule = createTestRule('test-1');
      await engine.addRule(rule);

      await engine.removeRule('test-1');

      await expect(engine.getRule('test-1')).rejects.toThrow();
    });

    it('should enable and disable rules', async () => {
      const rule = createTestRule('test-1');
      await engine.addRule(rule);

      await engine.disableRule('test-1');
      const disabled = await engine.getRule('test-1');
      expect(disabled.enabled).toBe(false);

      await engine.enableRule('test-1');
      const enabled = await engine.getRule('test-1');
      expect(enabled.enabled).toBe(true);
    });
  });

  describe('event evaluation', () => {
    it('should evaluate rules in priority order', async () => {
      const lowPriorityRule = createTestRule('low', 1);
      const highPriorityRule = createTestRule('high', 2);
      
      await engine.addRule(lowPriorityRule);
      await engine.addRule(highPriorityRule);

      const event = createTestEvent(EventType.TASK_CREATED);
      const consoleSpy = jest.spyOn(console, 'log');

      await engine.evaluateEvent(event);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy.mock.calls[0][0]).toContain('high');
      expect(consoleSpy.mock.calls[1][0]).toContain('low');

      consoleSpy.mockRestore();
    });

    it('should only execute rules when conditions are met', async () => {
      const rule = createTestRule('test-1');
      rule.conditions = [
        new EventTypeCondition(EventType.TASK_UPDATED)
      ];
      
      await engine.addRule(rule);

      const event = createTestEvent(EventType.TASK_CREATED);
      const consoleSpy = jest.spyOn(console, 'log');

      await engine.evaluateEvent(event);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle rule evaluation errors gracefully', async () => {
      const rule = createTestRule('test-1');
      rule.actions = [
        {
          type: ActionType.CUSTOM,
          parameters: {},
          execute: async () => {
            throw new Error('Test error');
          }
        }
      ];
      
      await engine.addRule(rule);

      const event = createTestEvent(EventType.TASK_CREATED);
      const consoleSpy = jest.spyOn(console, 'error');

      await engine.evaluateEvent(event);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error evaluating rule'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });
}); 