export interface IntegrationAdapter {
  // Initialize the adapter with configuration
  initialize(config: Record<string, any>): Promise<void>;
  
  // Get the name of the integration
  getName(): string;
  
  // Check if the adapter is properly configured
  isConfigured(): boolean;
  
  // Get the current configuration
  getConfig(): Record<string, any>;
}

// Common response types that might be used across different adapters
export interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Common configuration interface
export interface IntegrationConfig {
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  [key: string]: any;
} 