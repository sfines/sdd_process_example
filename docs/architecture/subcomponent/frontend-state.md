# Frontend State Management Architecture

This document details the frontend state management architecture, which is responsible for managing the application state on the client-side.

## Architectural Decisions

- **[ADR-006: Frontend State Management](./../adrs/006-frontend-state-management.md)**

## Technology Stack

| Component | Technology | Version | Purpose                 |
| --------- | ---------- | ------- | ----------------------- |
| **State** | Zustand    | 4.4+    | Global state management |

## Component Interaction Flow

### Flow 3: Reconnection After Disconnect

```mermaid
sequenceDiagram
    participant ReactApp
    participant SocketIO_Client
    participant Backend
    participant Valkey
    participant SocketIO_Server

    SocketIO_Client->>ReactApp: Detects disconnect event
    ReactApp->>ReactApp: Shows "Reconnecting..." status
    SocketIO_Client->>SocketIO_Server: Begins exponential backoff reconnection
    SocketIO_Server->>SocketIO_Client: Reconnects
    SocketIO_Client->>Backend: Reconnects with session cookie
    Backend->>Backend: Validates session
    Backend->>Valkey: Retrieves room
    Valkey-->>Backend: Returns room
    Backend->>SocketIO_Server: Rejoins client to Socket.io room
    SocketIO_Server-->>Backend: Confirms rejoin
    Backend->>SocketIO_Client: Emits full room state
    SocketIO_Client->>ReactApp: "room_state" event
    ReactApp->>ReactApp: Updates Zustand with current room state
    ReactApp->>ReactApp: Updates UI to "Connected"
```

See the [JSON Schema](./json-schema.md) for detailed data structures.
