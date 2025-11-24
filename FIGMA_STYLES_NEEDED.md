# Figma Styles Implementation Status

**Date:** 2025-11-24
**Status:** ⚠️ **STYLES NOT IMPLEMENTED**

## Current State

### ✅ What's Implemented:

- Layout: Single-column centered design with bottom drawer
- Components: shadcn/ui primitives (Button, Card, Badge, Input)
- Design tokens: CSS custom properties in globals.css
- Tailwind config: Proper theme extension

### ❌ What's Missing: DARK THEME STYLES

The Figma design uses a **dark theme** with specific styling that's not applied:

## Required Style Changes

### 1. Background Colors

**Figma Design:**

```tsx
// Main background
className = 'bg-slate-900';

// Card backgrounds
className = 'bg-slate-900 rounded-xl border border-slate-800';

// Input backgrounds
className = 'bg-slate-800 border-slate-700';
```

**Current Implementation:**

```tsx
// Generic tokens
className = 'bg-background';
className = 'bg-card';
className = 'bg-muted';
```

### 2. Text Colors

**Figma Design:**

```tsx
className = 'text-slate-100'; // Primary text
className = 'text-slate-400'; // Secondary text
className = 'text-slate-300'; // Tertiary text
```

**Current Implementation:**

```tsx
className = 'text-foreground';
className = 'text-muted-foreground';
```

### 3. Buttons

**Figma Design:**

```tsx
// Primary Roll button with gradient
className =
  'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700';

// Ghost buttons
className = 'text-slate-400 hover:text-slate-200';
```

**Current Implementation:**

```tsx
// shadcn/ui default button
<Button>Roll</Button>
```

### 4. Dice Icon Container

**Figma Design:**

```tsx
<div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
  <Dices className="w-8 h-8 text-white" />
</div>
```

**Current Implementation:**

```tsx
// No special styling
```

### 5. Room Code Badge

**Figma Design:**

```tsx
<Badge className="font-mono text-sm px-3 py-1 border-purple-600/50 bg-purple-950/30 text-purple-300">
  {roomCode}
</Badge>
```

**Current Implementation:**

```tsx
<Badge variant="outline" className="font-mono text-sm px-3 py-1">
  {roomCode}
</Badge>
```

## Files That Need Updating

### High Priority (Core User Experience):

1. **frontend/src/components/DiceInput.tsx**
   - Add gradient background to dice icon
   - Add gradient Roll button
   - Use slate colors for inputs and labels

2. **frontend/src/components/VirtualRollHistory.tsx**
   - Already using Card component, but may need dark theme adjustments
   - Check badge colors for player names

3. **frontend/src/pages/RoomView.tsx**
   - Top bar: Add dark background (`bg-slate-900`)
   - Bottom drawer: Dark theme styling
   - Room code badge: Purple gradient styling

4. **frontend/src/components/RoomCodeDisplay.tsx**
   - Compact mode: Purple gradient badge
   - Full mode: Dark card background

5. **frontend/src/components/PlayerList.tsx**
   - Dark background for cards
   - Slate colors for text

### Optional (Can Use Generic Tokens):

- HomePage (can keep current styling)
- Connection indicators (already using specific colors)

## Implementation Approach

### Option 1: Apply Dark Theme Class

Add `dark` class to root element and use existing design tokens:

```tsx
<html className="dark">
```

### Option 2: Direct Slate Colors

Replace generic tokens with specific slate colors per Figma:

```tsx
className = 'bg-slate-900 text-slate-100';
```

### Option 3: Hybrid Approach (RECOMMENDED)

- Use dark theme for semantic elements (background, foreground)
- Use specific slate colors for specific Figma designs (dice roller, badges)
- Maintain flexibility for future theme switching

## Recommended Next Steps

1. **Enable dark mode** by default (add `dark` class to `<html>`)
2. **Update DiceInput** with gradient styling
3. **Update RoomCodeDisplay** with purple badge
4. **Update RoomView top bar** with slate-900 background
5. **Test all components** in dark theme

## Reference Files

- Figma Design: `docs/uex/figma-design/src/components/DiceRoller.tsx`
- Figma Design: `docs/uex/figma-design/src/components/RoomView.tsx`
- Current Styles: `frontend/src/styles/globals.css`
- Tailwind Config: `tailwind.config.js`

---

**Note:** The layout is correct, but the visual styling (colors, gradients, dark theme) is not applied.
