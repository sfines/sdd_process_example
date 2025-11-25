# Technical Decision TD-001: Virtual Scrolling Library Migration

**Date:** 2025-11-24
**Status:** Implemented
**Package Manager:** pnpm (NOT npm or yarn)

## Problem

react-window had TypeScript issues and cards overlapped with dynamic content.

## Solution

Migrated to @tanstack/react-virtual for better TypeScript support and dynamic height handling.

## Rationale

- First-class TypeScript support
- Active maintenance (TanStack ecosystem)
- Dynamic height calculation with measure() API
- Better performance and smaller bundle

## Implementation

```bash
pnpm remove react-window
pnpm add @tanstack/react-virtual@3.13.12
```

Roll cards now properly expand and push previous rolls down without overlap.

## Result

✅ No card overlap
✅ Firefox compatible
✅ TypeScript fully supported
✅ Dynamic expansion works correctly

See full details in commit ecc84c3.
