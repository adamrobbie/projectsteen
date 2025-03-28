# Event System Documentation

## Event Structure

All events in the system follow a common base structure:

```typescript
interface BaseEvent {
  id: string;           // Unique identifier for the event
  timestamp: Date;      // When the event occurred
  source: EventSource;  // Origin of the event
  type: EventType;      // Type of event
  payload: any;         // Event-specific data
  metadata: {           // Additional context
    correlationId?: string;  // For tracking related events
    userId?: string;        // User who triggered the event
    priority?: number;      // Event processing priority
    retryCount?: number;    // Number of retry attempts
  };
}
```

## Event Sources

Events can originate from various sources:

```typescript
enum EventSource {
  GITHUB = 'github',    // GitHub integration
  JIRA = 'jira',        // JIRA integration
  SYSTEM = 'system',    // Internal system events
  USER = 'user'         // User interface actions
}
```

## Event Types

### Task Events

```typescript
interface TaskEvent extends BaseEvent {
  type: EventType.TASK_CREATED | EventType.TASK_UPDATED | EventType.TASK_COMPLETED | EventType.TASK_BLOCKED;
  payload: {
    taskId: string;
    title: string;
    description?: string;
    status: string;
    assignee?: string;
    priority?: string;
    labels?: string[];
    dueDate?: Date;
    parentTaskId?: string;
    dependencies?: string[];
  };
}
```

Example:
```json
{
  "id": "evt_123",
  "timestamp": "2024-03-20T10:00:00Z",
  "source": "github",
  "type": "task.created",
  "payload": {
    "taskId": "TASK-123",
    "title": "Implement new feature",
    "description": "Add user authentication",
    "status": "TODO",
    "assignee": "john.doe",
    "priority": "HIGH",
    "labels": ["feature", "auth"],
    "dueDate": "2024-03-25T00:00:00Z"
  },
  "metadata": {
    "correlationId": "corr_123",
    "userId": "system",
    "priority": 1
  }
}
```

### Sprint Events

```typescript
interface SprintEvent extends BaseEvent {
  type: EventType.SPRINT_STARTED | EventType.SPRINT_ENDED | EventType.SPRINT_BLOCKED | EventType.SPRINT_METRICS_UPDATED;
  payload: {
    sprintId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    status: string;
    teamId: string;
    velocity?: number;
    storyPoints?: number;
    blockers?: string[];
  };
}
```

Example:
```json
{
  "id": "evt_124",
  "timestamp": "2024-03-20T10:00:00Z",
  "source": "jira",
  "type": "sprint.started",
  "payload": {
    "sprintId": "SPRINT-123",
    "name": "Sprint 1",
    "startDate": "2024-03-20T00:00:00Z",
    "endDate": "2024-03-27T00:00:00Z",
    "status": "ACTIVE",
    "teamId": "TEAM-123",
    "velocity": 20,
    "storyPoints": 25
  },
  "metadata": {
    "correlationId": "corr_124",
    "userId": "system"
  }
}
```

### Team Events

```typescript
interface TeamEvent extends BaseEvent {
  type: EventType.TEAM_MEMBER_AVAILABILITY | EventType.WORKLOAD_CHANGED | EventType.BLOCKERS_IDENTIFIED;
  payload: {
    teamId: string;
    memberId?: string;
    availability?: string;
    workload?: {
      current: number;
      capacity: number;
      tasks: string[];
    };
    blockers?: {
      id: string;
      description: string;
      impact: string;
      resolution?: string;
    }[];
  };
}
```

Example:
```json
{
  "id": "evt_125",
  "timestamp": "2024-03-20T10:00:00Z",
  "source": "system",
  "type": "team.member.availability",
  "payload": {
    "teamId": "TEAM-123",
    "memberId": "USER-123",
    "availability": "PARTIAL",
    "workload": {
      "current": 15,
      "capacity": 20,
      "tasks": ["TASK-123", "TASK-124"]
    }
  },
  "metadata": {
    "correlationId": "corr_125",
    "userId": "system"
  }
}
```

### Integration Events

```typescript
interface IntegrationEvent extends BaseEvent {
  type: EventType.SERVICE_CONNECTION_STATUS | EventType.SYNC_STATUS | EventType.ERROR;
  payload: {
    service: string;
    status: string;
    details?: {
      message?: string;
      code?: string;
      timestamp?: Date;
      retryable?: boolean;
    };
    metrics?: {
      latency?: number;
      successRate?: number;
      errorCount?: number;
    };
  };
}
```

Example:
```json
{
  "id": "evt_126",
  "timestamp": "2024-03-20T10:00:00Z",
  "source": "github",
  "type": "service.connection.status",
  "payload": {
    "service": "github",
    "status": "CONNECTED",
    "metrics": {
      "latency": 150,
      "successRate": 99.9,
      "errorCount": 1
    }
  },
  "metadata": {
    "correlationId": "corr_126",
    "userId": "system"
  }
}
```

## Event Processing Guidelines

1. **Event Validation**
   - All events must have a unique ID
   - Timestamps must be in ISO 8601 format
   - Required fields must be present
   - Payload structure must match the event type

2. **Event Correlation**
   - Use correlationId to track related events
   - Maintain event chains for debugging
   - Link events to their triggers

3. **Event Priority**
   - Critical events: Priority 1
   - Normal events: Priority 2
   - Background events: Priority 3

4. **Error Handling**
   - Include error details in payload
   - Set retryable flag for recoverable errors
   - Maintain error counts in metrics

5. **Event Persistence**
   - Store events with their full context
   - Maintain event history for auditing
   - Support event replay capability 