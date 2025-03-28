import { BaseEvent } from '../types/events';
import { Rule, RuleEngine, RuleStore } from '../types/rules';

export class DefaultRuleEngine implements RuleEngine {
  private rules: Map<string, Rule>;
  private store: RuleStore;

  constructor(store: RuleStore) {
    this.rules = new Map();
    this.store = store;
    this.initializeRules();
  }

  private async initializeRules(): Promise<void> {
    const rules = await this.store.getAll();
    rules.forEach(rule => {
      if (rule.enabled) {
        this.rules.set(rule.id, rule);
      }
    });
  }

  async addRule(rule: Rule): Promise<void> {
    await this.store.save(rule);
    if (rule.enabled) {
      this.rules.set(rule.id, rule);
    }
  }

  async removeRule(ruleId: string): Promise<void> {
    await this.store.delete(ruleId);
    this.rules.delete(ruleId);
  }

  async updateRule(rule: Rule): Promise<void> {
    await this.store.save(rule);
    if (rule.enabled) {
      this.rules.set(rule.id, rule);
    } else {
      this.rules.delete(rule.id);
    }
  }

  async getRule(ruleId: string): Promise<Rule> {
    return this.store.get(ruleId);
  }

  async getRules(): Promise<Rule[]> {
    return this.store.getAll();
  }

  async evaluateEvent(event: BaseEvent): Promise<void> {
    // Get all enabled rules and sort by priority (highest first)
    const enabledRules = Array.from(this.rules.values())
      .sort((a, b) => b.priority - a.priority);

    // Evaluate each rule's conditions and execute matching actions
    for (const rule of enabledRules) {
      try {
        const conditionsMet = rule.conditions.every(condition => 
          condition.evaluate(event)
        );

        if (conditionsMet) {
          // Execute all actions in sequence
          for (const action of rule.actions) {
            await action.execute(event);
          }
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
        // Continue with next rule even if one fails
      }
    }
  }

  async enableRule(ruleId: string): Promise<void> {
    const rule = await this.getRule(ruleId);
    rule.enabled = true;
    await this.updateRule(rule);
  }

  async disableRule(ruleId: string): Promise<void> {
    const rule = await this.getRule(ruleId);
    rule.enabled = false;
    await this.updateRule(rule);
  }
} 