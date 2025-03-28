import { IntegrationAdapter, IntegrationRegistry } from '../types/integrations.js';

export class DefaultIntegrationRegistry implements IntegrationRegistry {
  private adapters: Map<string, IntegrationAdapter>;
  private initializedAdapters: Set<string>;

  constructor() {
    this.adapters = new Map();
    this.initializedAdapters = new Set();
  }

  async registerAdapter(adapter: IntegrationAdapter): Promise<void> {
    // Validate adapter
    if (!adapter.id || !adapter.type) {
      throw new Error('Invalid adapter: missing required fields');
    }

    // Check for duplicate ID
    if (this.adapters.has(adapter.id)) {
      throw new Error(`Adapter with ID ${adapter.id} already registered`);
    }

    // Store adapter first
    this.adapters.set(adapter.id, adapter);

    try {
      // Initialize and validate adapter if not already initialized
      if (!this.initializedAdapters.has(adapter.id)) {
        await adapter.initialize();
        const isValid = await adapter.validate();
        if (!isValid) {
          throw new Error(`Adapter ${adapter.id} validation failed`);
        }

        // Connect adapter
        await adapter.connect();
        this.initializedAdapters.add(adapter.id);
      }
    } catch (error) {
      // Clean up on failure
      this.adapters.delete(adapter.id);
      this.initializedAdapters.delete(adapter.id);
      throw error;
    }
  }

  async unregisterAdapter(adapterId: string): Promise<void> {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter with ID ${adapterId} not found`);
    }

    try {
      // Disconnect adapter if it was initialized
      if (this.initializedAdapters.has(adapterId)) {
        await adapter.disconnect();
        this.initializedAdapters.delete(adapterId);
      }

      // Remove adapter
      this.adapters.delete(adapterId);
    } catch (error) {
      console.error(`Error unregistering adapter ${adapterId}:`, error);
      throw error;
    }
  }

  getAdapter(adapterId: string): IntegrationAdapter {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new Error(`Adapter with ID ${adapterId} not found`);
    }
    return adapter;
  }

  getAdapters(): IntegrationAdapter[] {
    return Array.from(this.adapters.values());
  }

  getAdaptersByType(type: string): IntegrationAdapter[] {
    return this.getAdapters().filter(adapter => adapter.type === type);
  }

  async shutdown(): Promise<void> {
    // Disconnect all initialized adapters
    const disconnectPromises = Array.from(this.initializedAdapters)
      .map(adapterId => {
        const adapter = this.adapters.get(adapterId);
        return adapter?.disconnect();
      })
      .filter((promise): promise is Promise<void> => promise !== undefined);
    
    await Promise.all(disconnectPromises);
    
    // Clear all state
    this.adapters.clear();
    this.initializedAdapters.clear();
  }
} 