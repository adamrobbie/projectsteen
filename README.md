# AI Scrum Master Bot

An intelligent, modular, and extensible AI-powered Scrum Master bot that manages and coordinates software development processes across multiple integration services.

## Project Goals

1. **Modular Architecture**
   - Design a highly modular system that can easily integrate with different service providers
   - Maintain a stable, non-breaking public API for all integrations
   - Support plug-and-play integration with various development tools and services

2. **Service Integration Abstraction**
   - Abstract integration services into domain-specific modules
   - Currently supporting GitHub and JIRA integrations
   - Designed to be easily extended for additional services

3. **Web-Based Management Interface**
   - Provide a user-friendly web interface for bot configuration and management
   - Enable real-time monitoring and control of bot activities
   - Support customization of bot behaviors and rules

4. **Rule-Based Automation**
   - Implement a robust rules engine for automated decision-making
   - Support scheduled and event-driven execution of tasks
   - Enable easy configuration and modification of bot behaviors

## Core Responsibilities

The AI Scrum Master bot is designed to handle the following core responsibilities:

1. **Sprint Management**
   - Sprint planning and estimation
   - Sprint execution monitoring
   - Sprint retrospective facilitation
   - Velocity tracking and reporting

2. **Task Management**
   - Task creation and assignment
   - Priority management
   - Dependencies tracking
   - Status updates and notifications

3. **Team Coordination**
   - Team capacity planning
   - Workload distribution
   - Blockers identification and resolution
   - Team communication facilitation

4. **Metrics and Reporting**
   - Sprint metrics collection
   - Performance analytics
   - Progress reporting
   - Trend analysis

## Technical Architecture

### Core Components

1. **Integration Layer**
   - Abstract service interfaces
   - Service-specific adapters
   - Data transformation layer

2. **Rules Engine**
   - Rule definition and management
   - Rule execution scheduler
   - Event handling system

3. **Web Interface**
   - Configuration management
   - Monitoring dashboard
   - Control panel

4. **Domain Services**
   - Sprint management service
   - Task management service
   - Team coordination service
   - Metrics service

### Event System Architecture

The bot operates on an event-driven architecture that handles multiple integration streams:

1. **Event Streams**
   - GitHub Events (PRs, Issues, Comments)
   - JIRA Events (Issues, Comments, Status Changes)
   - System Events (Scheduled Tasks, Alerts)
   - User Events (Web Interface Actions)

2. **Event Processing Pipeline**
   - Event Ingestion Layer
     - Webhook handlers for external services
     - Scheduled task triggers
     - User action handlers
   
   - Event Normalization Layer
     - Standardized event format
     - Event enrichment
     - Context preservation
   
   - Event Routing Layer
     - Event type classification
     - Priority-based routing
     - Load balancing
   
   - Event Processing Layer
     - Rule evaluation
     - Action execution
     - State management
   
   - Event Response Layer
     - Action execution
     - External service updates
     - User notifications

3. **Event Types**
   - Task Events
     - Task created
     - Task updated
     - Task completed
     - Task blocked
   
   - Sprint Events
     - Sprint started
     - Sprint ended
     - Sprint blocked
     - Sprint metrics updated
   
   - Team Events
     - Team member availability
     - Workload changes
     - Blockers identified
   
   - Integration Events
     - Service connection status
     - Sync status
     - Error events

4. **Event State Management**
   - Event persistence
   - State recovery
   - Event replay capability
   - Audit logging

### Integration Services

Currently supported integrations:
- GitHub
- JIRA

Future integration possibilities:
- Azure DevOps
- Trello
- Linear
- Custom integrations

### Testing Structure

The project uses a co-located testing approach with `__tests__` directories alongside the source code:

```
src/
  ├── core/
  │   ├── __tests__/
  │   │   ├── EventPipeline.test.ts
  │   │   └── EventRouter.test.ts
  │   ├── EventPipeline.ts
  │   └── EventRouter.ts
  └── types/
      └── events.ts
```

This structure was chosen over a separate `tests/` directory for several reasons:

1. **Co-location**: Tests are placed next to the code they're testing, making it easier to find and maintain related files
2. **Import Clarity**: Relative imports are simpler and more intuitive when tests are co-located
3. **IDE Support**: Most IDEs provide better navigation and refactoring support when tests are next to their implementation
4. **Package Boundaries**: When the code is split into packages, co-located tests move with their code
5. **Test Discovery**: Jest automatically finds and runs tests in `__tests__` directories, making test discovery more reliable

## Getting Started

[To be added: Installation and setup instructions]

## Configuration

[To be added: Configuration guide]

## Development

[To be added: Development setup and guidelines]

## Contributing

[To be added: Contribution guidelines]

## License

ISC 