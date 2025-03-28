import { IntegrationRegistry } from '../types/integrations.js';
import { GitHubIntegrationAdapter, JiraIntegrationAdapter } from '../types/integrations.js';
import { BotConfig } from '../types/bot.js';

export class IntegrationManager {
  private registry: IntegrationRegistry;

  constructor(registry: IntegrationRegistry) {
    this.registry = registry;
  }

  async initializeIntegrations(config: BotConfig): Promise<void> {
    const { enabled, config: integrationConfig } = config.integrations;

    for (const integrationType of enabled) {
      try {
        switch (integrationType) {
          case 'github':
            await this.initializeGitHub(integrationConfig.github);
            break;
          case 'jira':
            await this.initializeJira(integrationConfig.jira);
            break;
          default:
            console.warn(`Unknown integration type: ${integrationType}`);
        }
      } catch (error) {
        console.error(`Failed to initialize ${integrationType} integration:`, error);
        throw error;
      }
    }
  }

  private async initializeGitHub(config: any): Promise<void> {
    const adapter = new GitHubIntegrationAdapter({
      id: 'github',
      type: 'github',
      credentials: config,
      settings: {},
      enabled: true
    });
    await this.registry.registerAdapter(adapter);
  }

  private async initializeJira(config: any): Promise<void> {
    const adapter = new JiraIntegrationAdapter({
      id: 'jira',
      type: 'jira',
      credentials: config,
      settings: {},
      enabled: true
    });
    await this.registry.registerAdapter(adapter);
  }

  async validateIntegrationConfig(config: BotConfig): Promise<void> {
    const { enabled, config: integrationConfig } = config.integrations;
    
    for (const integrationType of enabled) {
      switch (integrationType) {
        case 'github':
          if (!integrationConfig.github?.token || !integrationConfig.github?.organization) {
            throw new Error('GitHub integration requires token and organization');
          }
          break;
        case 'jira':
          if (!integrationConfig.jira?.url || !integrationConfig.jira?.username || !integrationConfig.jira?.token) {
            throw new Error('JIRA integration requires url, username, and token');
          }
          break;
      }
    }
  }
} 