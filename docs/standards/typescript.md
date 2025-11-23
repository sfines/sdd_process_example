# TypeScript Coding Standards

## Purpose

This document defines a concise, practical TypeScript coding standard for frontend services and libraries. It is written for developers and for AI agents that will generate or review code. It includes: high-value rules, a one-page Decision Table, "bad → good" examples, tooling/config snippets (ESLint, Prettier, Vitest, tsconfig), a one-page PR checklist, CI snippet, and a migration plan.

## Decision Table (Top 12 rules)

| #   | Rule                                               | Enforcement | Rationale                                                                    |
| --- | -------------------------------------------------- | ----------: | ---------------------------------------------------------------------------- |
| 1   | Use ESLint + Prettier for formatting/linting       |        FAIL | Single-source formatting + linting ensures consistent style and fast checks. |
| 2   | Require strict type checking (`tsconfig.json`)     |        FAIL | Prevents major runtime errors and enables safe refactors.                    |
| 3   | No `any` in new code                               |        FAIL | Avoids unsafe type assertions that undermine the type system.                |
| 4   | Use named exports only (no `default export`)       |        FAIL | Ensures consistency and avoids naming collisions.                            |
| 5   | Use structured logging                             |        WARN | Facilitates log parsing for observability—structured logs reduce ambiguity.  |
| 6   | Secure secrets handling                            |        FAIL | Prevents accidental exposure of credentials and secrets.                     |
| 7   | Use `for...of` for array iteration                 |        INFO | More readable and less error-prone than traditional `for` loops.             |
| 8   | Use `pnpm` and a pinned Node.js version (e.g., 24) |        INFO | Standardizes local and CI environments.                                      |
| 9   | Avoid global mutable states                        |        WARN | Easier to test and reason about code.                                        |
| 10  | Catch explicit exceptions only                     |        FAIL | Avoids hiding unexpected errors and protects control flow.                   |
| 11  | Use `async/await` for I/O-bound code               |        WARN | Prevents blocking and enables concurrency for web apps.                      |
| 12  | Document public functions with JSDoc               |        INFO | Improves discoverability and guarantees clearer APIs.                        |

## Core rules & explanations

### 1. File Structure & Basics

- **File Organization**: Files must be structured in this order: Copyright, `@fileoverview` JSDoc, Imports, Implementation.
- **File Encoding**: UTF-8 only. Use single quotes (`'`) for strings.
- **Whitespace**: Use spaces, not tabs.

### 2. Imports & Exports

- **Import Style**: Use named imports. Never use `default export`.
- **Import Paths**: Use relative paths (`./foo`) for same-project files.
- **Type Imports**: Use `import type {...}` for type-only imports.

### 3. Variables & Declarations

- **Use `const` and `let`**: `const` by default, `let` only when reassignment is necessary. Never use `var`.
- **One variable per declaration**.

### 4. Types & Type System

- **Type Inference**: Let TypeScript infer simple types. Annotate complex types for clarity.
- **Primitive Types**: Use lowercase: `string`, `number`, `boolean`.
- **Interfaces vs Type Aliases**: Prefer `interface` for object types.
- **`any` vs `unknown`**: Avoid `any`. Use `unknown` for truly unknown types and perform type checking.

### 5. Classes

- **Structure**: Fields, constructor, methods. Use `readonly` for properties never reassigned.
- **Visibility**: Use `private`, `protected`. Default is `public` (do not write it explicitly).
- **No `#private` fields**: Use TypeScript's `private` keyword.

### 6. Functions

- **Style**: Prefer function declarations for named functions. Use arrow functions for callbacks.
- **`this`**: Avoid `this` outside of class methods. Use arrow functions to preserve `this` context.

### 7. Control Flow

- **Braces**: Always use braces for blocks (`if`, `for`, `while`).
- **Equality**: Always use `===` and `!==`. Exception: `== null` to check for `null` or `undefined`.

### 8. Exception Handling

- **Throw Errors**: Always `throw new Error()`. Never throw strings or objects.
- **Catching**: Catch as `unknown` and perform instance checks.

## Tooling & Config snippets

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "incremental": true,
    "isolatedModules": true,
    "jsx": "preserve"
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

### `.eslintrc.cjs`

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
```

### `prettier.config.js`

```javascript
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
};
```

### `package.json` scripts

```json
"scripts": {
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write .",
  "typecheck": "tsc --noEmit",
  "test": "vitest"
}
```

### `.pre-commit-config.yaml`

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
  - repo: https://github.com/prettier/prettier
    rev: 3.3.2
    hooks:
      - id: prettier
  - repo: https://github.com/eslint/eslint
    rev: v9.5.0
    hooks:
      - id: eslint
        args: [--fix]
```

## PR reviewer checklist (10 items)

1.  `pnpm format` and `pnpm lint` pass locally.
2.  `pnpm typecheck` returns no errors.
3.  New public functions/methods have JSDoc comments.
4.  No `any` in new code; `unknown` is used correctly.
5.  No `default export` is used.
6.  Secrets are not committed; config uses environment variables.
7.  Exceptions are typed and handled (no bare `catch`).
8.  Tests cover new behaviors and edge cases.
9.  Files formatted and imports sorted.
10. Update the Decision Table if the change introduces a new rule.

## Migration plan

1.  Add `tsconfig.json`, `.eslintrc.cjs`, `prettier.config.js`, and `.pre-commit-config.yaml`.
2.  Run `pnpm format --fix` and `pnpm lint --fix` to fix format and easy style errors.
3.  Turn on incremental type checking via `pnpm typecheck` with `strict` toggles per module.
4.  Add CI gating: lint → format → typecheck → test.
5.  Incrementally enforce `noImplicitAny` with a targeted schedule.

## React-Specific Patterns

### Component Composition (Humble Components Pattern)

**Rule:** Child components render ONLY content. Parent components provide structure (containers, headings, layout).

**Rationale:** Prevents duplicate DOM elements, ensures consistency, improves reusability.

**Reference:** See ADR-012: Component Composition Pattern

#### Bad Example

```tsx
// PlayerList.tsx - ❌ BAD: Component includes container and heading
export default function PlayerList({ players }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Players</h2>
      <ul className="space-y-2">
        {players.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### Good Example

```tsx
// PlayerList.tsx - ✅ GOOD: Component renders only content
export default function PlayerList({ players }: Props) {
  return (
    <>
      {players.length === 0 ? (
        <p className="text-gray-500 text-sm">No players yet</p>
      ) : (
        <ul className="space-y-2" role="list">
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      )}
    </>
  );
}

// RoomView.tsx - Parent provides structure
function RoomView() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Players ({players.length})
      </h2>
      <PlayerList players={players} />
    </div>
  );
}
```

### React useEffect Cleanup Pattern

**Rule:** Never call state reset functions in useEffect cleanup unless certain the component is unmounting, not just dependencies changing.

**Rationale:** Cleanup runs on EVERY dependency change, not just unmount. Resetting state on navigation breaks user experience.

**Reference:** See ADR-011: React State Persistence Pattern

#### Bad Example

```tsx
// ❌ BAD: reset() called in cleanup - runs on navigate reference change
useEffect(() => {
  socket.on('connect', handleConnect);
  socket.on('room_created', handleRoomCreated);

  return () => {
    socket.off('connect', handleConnect);
    socket.off('room_created', handleRoomCreated);
    reset(); // ❌ WRONG - clears state on navigation
  };
}, [handleConnect, handleRoomCreated, reset, navigate]);
```

#### Good Example

```tsx
// ✅ GOOD: No reset in cleanup - state persists across navigation
useEffect(() => {
  socket.on('connect', handleConnect);
  socket.on('room_created', handleRoomCreated);

  return () => {
    socket.off('connect', handleConnect);
    socket.off('room_created', handleRoomCreated);

    // DO NOT call reset() here!
    // This cleanup runs when dependencies change (like navigate reference),
    // NOT just on actual component unmount. Calling reset() here clears
    // player identity when navigating between routes.
    // State should only be reset on explicit user actions (logout, leave room).
  };
}, [handleConnect, handleRoomCreated, navigate]);

// Explicit state reset on user action
function handleLeaveRoom() {
  reset(); // ✅ GOOD - explicit user action
  navigate('/');
}
```

### State Management with Zustand

**Rule:** Never store WebSocket or ephemeral connection state in component state. Always use Zustand store as single source of truth.

**Rationale:** Ensures consistency across components, simplifies testing, enables proper state persistence.

#### Bad Example

```tsx
// ❌ BAD: Component state for room data
function RoomView() {
  const [players, setPlayers] = useState([]);
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    socket.on('player_joined', (data) => {
      setPlayers(data.players); // ❌ State scattered
    });
  }, []);

  return <PlayerList players={players} />;
}
```

#### Good Example

```tsx
// ✅ GOOD: Zustand store as single source of truth
function RoomView() {
  const players = useSocketStore((state) => state.players);
  const roomCode = useSocketStore((state) => state.roomCode);

  // Socket updates handled in useSocket hook → updates store
  // Components just read from store

  return <PlayerList players={players} />;
}
```

## React PR Checklist Additions

11. Components follow humble components pattern (content only, no containers/headings)
12. No state resets in useEffect cleanup (unless certain of unmount)
13. Zustand store used for shared state, not component state
14. Socket.io listeners in custom hook, not components directly
