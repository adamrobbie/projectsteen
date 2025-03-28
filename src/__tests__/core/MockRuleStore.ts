import { Rule, RuleStore } from '../../types/rules';

export class MockRuleStore implements RuleStore {
  private rules: Map<string, Rule>;

  constructor() {
    this.rules = new Map();
  }

  async save(rule: Rule): Promise<void> {
    this.rules.set(rule.id, rule);
  }

  async get(ruleId: string): Promise<Rule> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule with id ${ruleId} not found`);
    }
    return rule;
  }

  async getAll(): Promise<Rule[]> {
    return Array.from(this.rules.values());
  }

  async delete(ruleId: string): Promise<void> {
    this.rules.delete(ruleId);
  }

  clear(): void {
    this.rules.clear();
  }
} 