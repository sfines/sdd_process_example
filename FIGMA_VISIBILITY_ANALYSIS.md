# Visibility Issues Analysis

## User Report

"Connected message and other components don't disappear" on the roll a die page (RoomView)

## Current RoomView Structure

### Top Bar (Always Visible)

- Room code badge (compact)
- Connection status (Online/Offline)
  - Icon always visible
  - Text hidden on mobile (`hidden sm:inline`)
- Leave button

### Main Content

- Dice Roller card
- Roll History card

### Bottom

- Player list drawer (slides up)
- "X players online" button (when drawer closed)

## Potential Issues

### 1. Responsive Breakpoints

The connection status text uses `hidden sm:inline` which means:

- HIDDEN on mobile (< 640px)
- INLINE on small screens and up (≥ 640px)

**Issue:** If viewport is between breakpoints, behavior might be unexpected.

### 2. Conditional Rendering

Elements that should conditionally render:

- Drawer vs Button (based on `showPlayerList`)
- Connection text (based on `isConnected`)

**Symptoms if broken:**

- Both drawer and button visible at same time
- Both "Online" and "Offline" text visible
- Elements stacking/overlapping

### 3. Z-Index Layering

Current z-indexes:

- Top bar: `z-50`
- Drawer: `z-40`
- Toast: `z-50`

**Issue:** Drawer might appear above top bar if not properly structured.

### 4. CSS Specificity

Tailwind's `*` transition rule might conflict:

```css
* {
  transition-property: color, background-color, border-color, opacity;
  transition-duration: 150ms;
}
```

**Issue:** All elements animate, even when conditionally rendered, which might cause visual artifacts.

## Recommended Fixes

### Fix 1: Remove Mobile-Only Hidden Classes

Change `hidden sm:inline` to always show text, or remove text entirely on mobile.

### Fix 2: Add Explicit Display None

Ensure hidden elements have `display: none` not just opacity/transform.

### Fix 3: Verify Conditional Logic

Check that React state updates are triggering re-renders properly.

### Fix 4: Add Debug Indicators

Temporarily add visual borders to see what elements are actually rendering:

```tsx
className = 'border-2 border-red-500'; // Debug: see element boundaries
```

## Next Steps

1. Remove `hidden sm:inline` from connection status
2. Ensure drawer uses `translate-y-full` correctly (currently does)
3. Add `overflow-hidden` to parent containers if needed
4. Verify `showPlayerList` state is toggling correctly
