# Generate TypeScript Coding Standards

## Context

You are the BMAD Architect Agent responsible for establishing coding standards that will guide the BMAD Dev Agent in writing high-quality TypeScript code.

## Objective

Read and synthesize the Google TypeScript Style Guide to create a comprehensive set of TypeScript coding guidelines that the BMAD Dev Agent can use as a reference when implementing features, fixing bugs, or reviewing code.

## Source Material

Read the complete Google TypeScript Style Guide at:
https://google.github.io/styleguide/tsguide.html

Deliverables and structure

- Output must be in Markdown, include code examples, tooling snippets, and a one-page decision table listing the top 12 rules and their enforcement level (INFO, WARN, FAIL).

Also review modern TypeScript toolchain best practices (2025): ESLint + @typescript-eslint, Prettier, tsconfig strict flags (`strict`, `noImplicitAny`), `tslib` usage, `moduleResolution` (`node16`/`nodenext`), and test frameworks (Vitest/Jest). Include `pre-commit` and `package.json` dev scripts for `lint` and `format` steps.

- Include `pre-commit` and a `dev` script approach in `package.json` for `lint` and `format` steps.

- Type system guidelines and inference rules
- Class design patterns and member organization
- Function declaration and arrow function usage
- Control flow and exception handling patterns
- Naming conventions for all identifier types
- Documentation and commenting standards
- Explicitly disallowed features and anti-patterns
- Documentation and commenting standards
- Explicitly disallowed features and anti-patterns
- Tooling and config best practices (ESLint, Prettier, tsconfig, vitest)

### 2. Synthesize Actionable Guidelines

Transform the style guide into clear, actionable rules organized by category:

#### Essential Categories to Cover:

1. **File Basics**: Encoding, structure, whitespace
2. **Imports & Exports**: Module patterns, named vs default exports
3. **Variables & Types**: Declaration patterns, type inference, type annotations
4. **Classes**: Structure, visibility, members, static methods
5. **Functions**: Declaration styles, arrow functions, parameters
6. **Control Flow**: Conditionals, loops, switches, equality checks
7. **Error Handling**: Exception patterns, error instantiation
8. **Security & Secrets**: Input validation, secret management, safe deserialization, avoid eval
9. **Naming**: Case conventions, descriptive names, special cases
10. **Documentation**: JSDoc patterns, comment quality
11. **Anti-patterns**: Explicitly forbidden constructs and practices

### Recommended Rules — examples to include

- Use `no-floating-promises`: make async handling explicit.
- Enforce `strict` TypeScript compiler settings with progressive adoption plan for legacy code.
- Enforce `strict` TypeScript compiler settings with progressive adoption plan for legacy code.

### 3. Format Guidelines for Developer Use

- **Clear rule statement**: What to do or avoid
- **Code examples**: Show ✓ correct and ✗ incorrect patterns
- **Rationale**: Brief explanation of why (when non-obvious)
- **Exceptions**: Note any special cases or legitimate exceptions

- Post-implementation checks (code review stage)

### 5. Prioritize Common Scenarios

Emphasize guidelines for the most common development tasks:

- Creating new classes and interfaces
- Writing functions and methods
- Handling async operations
- Type annotations and inference
- Error handling patterns
- Module organization

## Output Format

Create a comprehensive markdown document with:

1. **Title and Purpose**: Clear statement of document's role

- Be immediately usable by the Dev Agent without referring to external sources
- Contain sufficient examples to clarify ambiguous situations
- Cover all major TypeScript language features and patterns

Deliverables and structure

- Provide a **10-item PR reviewer checklist** (explicit) in the final output for code reviews and pull requests.

### Maintainability

- Keep examples concise but complete

- Use clear, unambiguous language
- Provide decision rules for choosing between alternatives
- Include negative examples (what not to do)
- Make rules scannable with clear headings and structure

### Completeness

- Don't omit important rules even if they seem obvious
- Cover edge cases that commonly cause confusion
- Include tooling requirements (TypeScript version, compiler flags)
- Address both new code and maintaining existing code

## Example Section Structure

````markdown
## [Category Name]

### [Specific Guideline]

**Rule**: [Clear statement of what to do]

**Examples**:

```typescript
// ✓ Good: [explanation]
[correct code example]

// ✗ Bad: [explanation]
[incorrect code example]
```

## Validation

Before finalizing the document, verify:

- [ ] All major sections from Google Style Guide are covered
- [ ] Examples compile and are technically accurate
- [ ] Naming conventions are complete and consistent
- [ ] Disallowed features are explicitly listed
- [ ] Document is well-organized and navigable
- [ ] Checklist is practical and actionable
- [ ] No contradictory guidance exists
- [ ] Tooling examples are provided (`tsconfig`, `.eslintrc`, `prettier`, vitest config)
- [ ] ESLint configuration with TypeScript plugin and `prettier` integration is provided
- [ ] tsconfig strict settings are recommended and a migration path for legacy code is included
- [ ] Type-check + lint + tests run successfully via CI snippet
- [ ] Decision Table (top 12 rules with enforcement levels) is included
- [ ] Pre-commit configuration for ESLint and Prettier is suggested
- [ ] Tooling examples are provided (`tsconfig`, `.eslintrc`, `prettier`, vitest config)
- [ ] ESLint configuration with TypeScript plugin and `prettier` integration is provided
- [ ] tsconfig strict settings are recommended and a migration path for legacy code is included

## Notes for Implementation

When the Dev Agent uses these standards:

1. **First-time setup**: Read entire document to understand full scope
2. **During development**: Reference specific sections as needed
3. **Code review**: Use checklist to verify compliance
4. **Conflicts**: Google Style Guide takes precedence for interpretation
5. **Tooling adoption**: Use ESLint and Prettier with `--fix` for formatting; include `pnpm`/`npm` scripts and `pre-commit` hooks; include `npx tsc --noEmit` in CI to verify type coverage in pull requests. Consider using `pnpm` or `npm` and a `node` LTS version consistent with repo (e.g., Node 24), and recommend `pnpm` workspaces for monorepos.
6. **Updates**: Periodically sync with Google Style Guide changes

---

**Action**: Execute this prompt to generate the TypeScript coding standards document. Write the output to docs/standards/typescript.md.

Return only the Markdown content (no surrounding commentary) and follow the output structure exactly.

```

```
````
