# Generate TypeScript Coding Standards

## Context

You are the BMAD Architect Agent responsible for establishing coding standards that will guide the BMAD Dev Agent in writing high-quality TypeScript code.

## Objective

Read and synthesize the Google TypeScript Style Guide to create a comprehensive set of TypeScript coding guidelines that the BMAD Dev Agent can use as a reference when implementing features, fixing bugs, or reviewing code.

## Source Material

Read the complete Google TypeScript Style Guide at:
https://google.github.io/styleguide/tsguide.html

## Instructions

### 1. Analyze the Style Guide

Carefully read through the entire Google TypeScript Style Guide, paying special attention to:

- File structure and organization requirements
- Import/export patterns and module system usage
- Variable declaration best practices
- Type system guidelines and inference rules
- Class design patterns and member organization
- Function declaration and arrow function usage
- Control flow and exception handling patterns
- Naming conventions for all identifier types
- Documentation and commenting standards
- Explicitly disallowed features and anti-patterns

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
8. **Type System**: Interfaces, type aliases, generics, utility types
9. **Naming**: Case conventions, descriptive names, special cases
10. **Documentation**: JSDoc patterns, comment quality
11. **Anti-patterns**: Explicitly forbidden constructs and practices

### 3. Format Guidelines for Developer Use

Structure each guideline with:

- **Clear rule statement**: What to do or avoid
- **Code examples**: Show ✓ correct and ✗ incorrect patterns
- **Rationale**: Brief explanation of why (when non-obvious)
- **Exceptions**: Note any special cases or legitimate exceptions

### 4. Create Implementation Checklist

Provide a practical checklist that the Dev Agent can use during code generation:

- Pre-implementation checks (before writing code)
- During-implementation checks (while writing)
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
2. **Source Attribution**: Link to Google TypeScript Style Guide
3. **Organized Sections**: Logical grouping of related guidelines
4. **Examples**: Code snippets showing right vs wrong approaches
5. **Quick Reference Tables**: For naming conventions, case styles, etc.
6. **Summary Checklist**: Quick verification list for code reviews
7. **Best Practices**: High-level principles for TypeScript development

## Success Criteria

The resulting standards document should:

- Be immediately usable by the Dev Agent without referring to external sources
- Contain sufficient examples to clarify ambiguous situations
- Cover all major TypeScript language features and patterns
- Explicitly call out disallowed patterns to prevent common mistakes
- Be organized for quick lookup during development
- Balance completeness with readability (not overwhelming)

## Output Location

Write the synthesized coding standards to:
`prompts/standards/typescript.md`

## Additional Considerations

### Maintainability

- Keep examples concise but complete
- Use consistent formatting throughout
- Include version/date information for future updates

### Usability for AI Agent

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
````

**Rationale**: [Why this matters]

**Exceptions**: [If any]

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

## Notes for Implementation

When the Dev Agent uses these standards:
1. **First-time setup**: Read entire document to understand full scope
2. **During development**: Reference specific sections as needed
3. **Code review**: Use checklist to verify compliance
4. **Conflicts**: Google Style Guide takes precedence for interpretation
5. **Updates**: Periodically sync with Google Style Guide changes

---

**Action**: Execute this prompt to generate the TypeScript coding standards document.
```
