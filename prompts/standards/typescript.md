# TypeScript Coding Standards for BMAD Dev Agent

## Purpose

This document synthesizes the Google TypeScript Style Guide into actionable coding standards for the BMAD development agent. These guidelines ensure consistency, maintainability, and quality across all TypeScript projects.

## Source Reference

Based on: [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

---

## 1. File Structure & Basics

### File Organization

Files must be structured in this order:

1. Copyright information (if present)
2. `@fileoverview` JSDoc (if present)
3. Imports
4. Implementation code

Separate each section with exactly one blank line.

### File Encoding

- **UTF-8 only**
- Use single quotes (`'`) for strings, not double quotes (`"`)
- Use template literals (backticks) for complex string concatenation
- No line continuations with backslash

### Whitespace

- Use spaces (0x20), never tabs
- Use special escape sequences (`\n`, `\t`, etc.) not numeric escapes
- For non-ASCII, use actual Unicode characters when clear (e.g., `∞`)

---

## 2. Imports & Exports

### Import Style

```typescript
// Named imports (preferred for frequently used symbols)
import {describe, it, expect} from './testing';

// Namespace imports (for large APIs with many symbols)
import * as tableview from './tableview';

// Never use default exports
export class Foo { ... }  // ✓ Good
export default class Foo { ... }  // ✗ Bad
```

### Import Rules

- Use **relative paths** (`./foo`) for same-project files
- Use **named exports only**, never default exports
- Import types with `import type {...}` when used only as types
- Re-export types with `export type`
- Never use `namespace` or `require()` syntax

### Module Organization

- Export symbols used outside the module
- Minimize exported API surface
- No mutable exports (`export let`)
- No container classes with only static members
- Use explicit getters for mutable state if needed

---

## 3. Variables & Declarations

### Use `const` and `let`

```typescript
const foo = "value"; // ✓ Prefer const
let bar = "value"; // ✓ Use let if reassignment needed
var baz = "value"; // ✗ Never use var
```

### Declaration Rules

- One variable per declaration
- Use `const` by default, `let` only when reassignment is necessary
- Never use `var`
- Variables must not be used before declaration

---

## 4. Types & Type System

### Type Inference

```typescript
// ✓ Let TypeScript infer simple types
const x = 15;
const users = new Set<string>(); // Specify generics for empty collections

// ✓ Annotate for clarity in complex cases
const value: string[] = await rpc.getSomeValue().transform();
```

### Primitive Types

- Use lowercase: `string`, `number`, `boolean`
- Never use wrapper types: `String`, `Boolean`, `Number`
- Use `undefined` or `null` based on API context

### Structural Types

```typescript
// ✓ Use interfaces for structural types
interface Foo {
  a: number;
  b: string;
}

const foo: Foo = { a: 123, b: "abc" };

// ✗ Don't rely on inference for type contracts
const badFoo = { a: 123, b: "abc" }; // Type inferred, not explicit
```

### Interfaces vs Type Aliases

```typescript
// ✓ Prefer interfaces for object types
interface User {
  firstName: string;
  lastName: string;
}

// ✗ Avoid type aliases for object literals
type User = {
  firstName: string;
  lastName: string;
};
```

### Array Types

```typescript
// ✓ Simple types use syntax sugar
let a: string[];
let b: readonly string[];
let c: string[][];

// ✓ Complex types use Array<T>
let d: Array<{ n: number; s: string }>;
let e: Array<string | number>;
let f: ReadonlyArray<string | number>;
```

### `any` vs `unknown`

```typescript
// ✗ Avoid any when possible
const danger: any = value;

// ✓ Use unknown for truly unknown types
const val: unknown = value;
if (typeof val === "string") {
  // Now safe to use as string
}
```

### Nullability

- Use `|null` or `|undefined` inline, not in type aliases
- Prefer optional fields (`field?:`) over `|undefined`
- Initialize class fields to avoid undefined

---

## 5. Classes

### Class Structure

```typescript
class Example {
  // Fields with initializers
  private readonly userList: string[] = [];

  // Constructor with parameter properties
  constructor(private readonly service: Service) {}

  // Methods separated by blank lines
  doSomething(): void {
    // implementation
  }

  getOther(): number {
    return 4;
  }
}
```

### Class Rules

- No semicolons after class declarations
- Use parameter properties to reduce boilerplate
- Use `readonly` for properties never reassigned
- Initialize fields where declared when possible
- No `#private` fields (use TypeScript `private`)
- Separate constructor with blank lines above and below

### Visibility

- Use `private`, `protected`, or `public` (not `#private`)
- Default is public, never write `public` except for parameter properties
- Limit visibility as much as possible
- Never use `obj['foo']` to bypass visibility

### Static Methods

- Avoid private static methods (use module-local functions)
- Don't call static methods dynamically
- Don't use `this` in static contexts

### Getters/Setters

- Getters must be pure functions (no side effects)
- Use to hide implementation details
- Don't create pass-through accessors
- Prefix hidden properties (e.g., `wrappedBar`, `barInternal`)

---

## 6. Functions

### Function Style

```typescript
// ✓ Prefer function declarations for named functions
function foo(): number {
  return 42;
}

// ✓ Use arrow functions for callbacks and short functions
const callback = (x: number) => x * 2;

// ✗ Don't use function expressions
bar(function() { ... });  // Bad
```

### Arrow Functions

```typescript
// ✓ Use block bodies when return value is unused
myPromise.then((v) => {
  console.log(v);
});

// ✓ Use concise bodies when return value is used
const doubled = values.map((v) => v * 2);

// ✓ Use void operator to ensure undefined return
myPromise.then((v) => void console.log(v));
```

### Function Rules

- Use arrow functions for callbacks
- Don't use `this` except in class methods or explicit `this` type
- Never pass named callbacks directly (wrap in arrow function)
- Prefer rest/spread over accessing `arguments`
- Keep parameter initializers simple with no side effects

### Formatting

- Attach `*` to `function` and `yield` keywords: `function* foo()`
- No space after `...` in rest/spread: `...args`
- Blank lines between function body statements for logical grouping
- No blank lines at start/end of function body

---

## 7. Control Flow

### Blocks & Braces

```typescript
// ✓ Always use braces
for (let i = 0; i < x; i++) {
  doSomethingWith(i);
}

if (x) {
  doSomething();
}

// ✓ Exception: single-line if statements
if (x) x.doFoo();
```

### Loops

```typescript
// ✓ Prefer for...of for arrays
for (const x of someArr) {
  // Use value directly
}

// ✓ Use for...of with Object.keys/values/entries for objects
for (const key of Object.keys(obj)) {
  doWork(key, obj[key]);
}

// ✗ Avoid for...in without hasOwnProperty check
for (const x in someArr) {
  // x is index, not value!
  console.log(x);
}
```

### Switch Statements

```typescript
switch (x) {
  case Y:
    doSomething();
    break;
  case Z:
  case W: // Empty cases can fall through
    doOther();
    break;
  default:
  // Always include default, even if empty
}
```

### Equality

```typescript
// ✓ Always use === and !==
if (foo === "bar" && baz !== bam) {
}

// ✓ Exception: == null checks for null/undefined
if (foo == null) {
}

// ✗ Never use == or != (except for null)
if (foo == "bar") {
} // Bad
```

---

## 8. Exception Handling

### Throw Only Errors

```typescript
// ✓ Always throw Error instances
throw new Error("oh noes!");
throw new MyCustomError("specific problem");

// ✗ Never throw primitives or non-Error objects
throw "oh noes!"; // Bad
throw { code: 500 }; // Bad
```

### Catching Errors

```typescript
try {
  doSomething();
} catch (e: unknown) {
  // Assume all errors are Error instances
  if (e instanceof Error) {
    console.error(e.message);
  }
  throw e;
}
```

### Exception Rules

- Instantiate errors with `new Error()`
- Only throw `Error` or subclasses
- Catch as `unknown`, not `any`
- Keep try blocks focused (minimal code inside)
- Empty catch blocks must have explanatory comment
- Use exceptions over ad-hoc error handling

---

## 9. Type Assertions & Checks

### Assertions

```typescript
// ✓ Use 'as' syntax
const x = (z as Foo).length;

// ✗ Don't use angle brackets
const x = (<Foo>z).length;

// ✓ Double assertion when necessary (through unknown)
(x as unknown as Foo).fooMethod();
```

### Assertion Guidelines

- Add explanatory comments for why assertion is safe
- Use type annotations (`: Foo`) instead of assertions for object literals
- Prefer runtime checks (`instanceof`, type guards) over assertions
- Non-null assertions (`x!`) require justification comment

---

## 10. Objects & Arrays

### Object Literals

```typescript
// ✓ Use object literals, not Object constructor
const obj = { a: 1, b: 2 };

// ✓ Use spread for shallow copies
const foo2 = { ...foo, num: 5 };

// ✓ Spread only objects into objects
const merged = { ...obj1, ...obj2 };

// ✗ Don't spread primitives or arrays into objects
const bad = { ...someArray }; // Bad
```

### Arrays

```typescript
// ✓ Use bracket notation
const arr = [1, 2, 3];

// ✗ Never use Array constructor
const arr = new Array(2); // Bad

// ✓ Use Array.from for sized arrays
const arr = Array.from<number>({ length: 5 }).fill(0);

// ✓ Use spread for shallow copies
const copy = [...original];
```

### Destructuring

```typescript
// ✓ Use destructuring for multiple values
const [a, b, c, ...rest] = generateResults();
const { name, age } = person;

// ✓ Provide defaults
function process({ value = 0 } = {}) {}

// ✓ Skip unused elements with commas
const [a, , b] = [1, 5, 10];
```

---

## 11. Naming Conventions

### Case Styles

| Type                              | Style          | Example                |
| --------------------------------- | -------------- | ---------------------- |
| Classes, Interfaces, Types, Enums | UpperCamelCase | `class UserService`    |
| Variables, Functions, Methods     | lowerCamelCase | `let userName`         |
| Global Constants, Enum Values     | CONSTANT_CASE  | `const MAX_SIZE = 100` |

### Naming Rules

- No leading/trailing underscores for private members
- No `opt_` prefix for optional parameters
- No `I` prefix for interfaces (e.g., `IMyInterface`)
- Descriptive names, avoid abbreviations
- Acronyms as words: `loadHttpUrl` not `loadHTTPURL`
- No Hungarian notation
- Single-letter variables only for short scopes (<10 lines)

### Special Cases

- Type parameters: single uppercase letter or UpperCamelCase
- Test methods: may use underscores `test_whenX_doesY()`
- Module imports: lowerCamelCase even if file is snake_case

---

## 12. Comments & Documentation

### JSDoc vs Regular Comments

```typescript
/** JSDoc for documentation users should read */
export class Foo {}

// Regular comment for implementation details
function helperFunction() {}
```

### JSDoc Rules

- Document all exported top-level symbols
- Use Markdown formatting
- Don't repeat type information (TypeScript provides types)
- Omit obvious `@param` and `@return` when name/type is clear
- Place JSDoc before decorators

### Comment Quality

```typescript
// ✗ Bad: just repeats the name
/** @param fooBarService The foo bar service */

// ✓ Good: adds useful information
/** @param amountLitres The amount to brew. Must fit the pot size! */
```

### Multi-line Comments

```typescript
// ✓ Use multiple single-line comments
// This is a longer comment
// that spans multiple lines

// ✗ Don't use block comments
/*
 * Block comments are
 * not preferred
 */
```

---

## 13. Disallowed Features

### Never Use

- ❌ `var` (use `const` or `let`)
- ❌ `with` keyword
- ❌ `eval()` or `Function(...string)`
- ❌ `const enum` (use `enum`)
- ❌ Default exports
- ❌ Namespace syntax (`namespace Foo { }`)
- ❌ Triple-slash references (`/// <reference>`)
- ❌ `require()` imports
- ❌ Wrapper types: `String`, `Boolean`, `Number` constructors
- ❌ `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`
- ❌ Debugger statements
- ❌ Non-standard/experimental features
- ❌ Modifying builtin prototypes
- ❌ `#private` identifiers (use `private`)

### Automatic Semicolon Insertion

- Always use explicit semicolons
- Never rely on ASI

---

## 14. Best Practices Summary

### Type Safety

1. Let TypeScript infer types when obvious
2. Use `unknown` over `any`
3. Prefer interfaces over type aliases for objects
4. Use structural typing with explicit annotations
5. Handle `null`/`undefined` close to source

### Code Organization

1. One class/interface per file (generally)
2. Group related functionality
3. Keep exports minimal
4. Use ES6 modules exclusively
5. Prefer composition over inheritance

### Maintainability

1. Write tests for all code
2. Keep functions small and focused
3. Avoid deep nesting
4. Use meaningful names
5. Document non-obvious behavior

### Consistency

1. Follow existing patterns in the file/project
2. Use automated formatting (Prettier/clang-format)
3. Enforce with linters (ESLint, tsetse)
4. Code review for patterns not caught by tooling

---

## 15. Implementation Checklist

When writing TypeScript code, verify:

- [ ] All imports use ES6 syntax (no `require`)
- [ ] Exports are named, not default
- [ ] Variables use `const`/`let`, never `var`
- [ ] Types are inferred or explicitly annotated appropriately
- [ ] Interfaces used for object types
- [ ] Classes use parameter properties where appropriate
- [ ] Functions use arrow syntax for callbacks
- [ ] Control flow uses `===`/`!==` (except `== null`)
- [ ] Errors are thrown with `new Error()`
- [ ] JSDoc present for exported symbols
- [ ] No disallowed features used
- [ ] Names follow case conventions
- [ ] Code is formatted consistently

---

## Conclusion

These standards synthesize the Google TypeScript Style Guide into actionable rules for the BMAD dev agent. Following these guidelines ensures:

- **Consistency** across the codebase
- **Maintainability** for long-term support
- **Safety** through proper typing and error handling
- **Readability** for all team members
- **Tooling compatibility** with modern development workflows

When in doubt, refer to the [full Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) for detailed explanations and rationale.
