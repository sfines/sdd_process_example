# ADR-007: Styling System

**Status:** Approved
**Date:** 2025-11-15
**Decision Maker:** Steve

## Context

Template uses Chakra UI, but PRD specifies Tailwind CSS.

## Decision

Replace Chakra UI with Tailwind CSS + headless UI components.

## Why Tailwind Over Chakra

- PRD explicitly specifies Tailwind
- Smaller bundle size (unused styles purged)
- More design control (not constrained by component library)
- Better for custom PWA UI

## Component Library

Use **Headless UI** for accessible components:

- Modal, Dialog, Menu, Popover
- Unstyled, full Tailwind control
- React-focused, hooks-based

## Setup

```bash
npm install -D tailwindcss postcss autoprefixer
npm install @headlessui/react
npx tailwindcss init -p
```

## Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "dice-red": "#DC2626",
        "dice-green": "#16A34A",
        "dm-purple": "#9333EA",
      },
    },
  },
};
```

## Consequences

- **Positive:** Matches PRD specification
- **Positive:** Smaller bundle size
- **Negative:** More manual styling (acceptable for focused UI)
- **Positive:** Headless UI ensures accessibility
