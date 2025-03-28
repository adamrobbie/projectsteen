import { BaseEvent, EventRouter, EventType } from '../types/events';

interface RouteConfig {
  priority: number;
  processor: string;
}

export class DefaultEventRouter implements EventRouter {
  private routes: Map<EventType, RouteConfig[]>;

  constructor() {
    this.routes = new Map();
  }

  async route(event: BaseEvent): Promise<void> {
    const routes = this.routes.get(event.type) || [];
    
    // Sort routes by priority (highest first)
    const sortedRoutes = [...routes].sort((a, b) => b.priority - a.priority);

    // Process through each route in priority order
    for (const route of sortedRoutes) {
      // Here we would typically dispatch to the appropriate processor
      // This is a placeholder for the actual implementation
      console.log(`Routing event ${event.id} to processor ${route.processor}`);
    }
  }

  addRoute(eventType: EventType, processor: string, priority: number): void {
    const routes = this.routes.get(eventType) || [];
    routes.push({ processor, priority });
    this.routes.set(eventType, routes);
  }

  removeRoute(eventType: EventType, processor: string): void {
    const routes = this.routes.get(eventType) || [];
    const filteredRoutes = routes.filter(route => route.processor !== processor);
    this.routes.set(eventType, filteredRoutes);
  }
} 