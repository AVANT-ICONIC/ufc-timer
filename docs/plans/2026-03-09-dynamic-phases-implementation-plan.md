# Dynamic Phases & Animated Badge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the negative timer by parsing dynamic offsets from ICS descriptions and add an animated GitHub badge link.

**Architecture:** 
1. Enhance the data normalization to use Regex for extracting phase offsets from the ICS `description` field.
2. Update the `CountdownTicker` component to correctly transition between phases without showing negative numbers.
3. Update the `Home` page and CSS to include an animated, expanding GitHub badge.

**Tech Stack:** Next.js (TypeScript), Vanilla CSS, `date-fns`.

---

### Task 1: Update Data Types

**Files:**
- Modify: `src/types/events.ts`

**Step 1: Add rawDescription to UfcEvent type**

```typescript
export type UfcEvent = {
  // ... existing fields
  rawDescription?: string | null; // Added to help debugging/parsing
};
```

**Step 2: Commit**

```bash
git add src/types/events.ts
git commit -m "types: add rawDescription to UfcEvent"
```

---

### Task 2: Implement Dynamic Parsing in Normalization

**Files:**
- Modify: `src/lib/ufc/normalize-events.ts`

**Step 1: Add helper function to parse offsets**

```typescript
function parseOffset(description: string, phase: 'Prelims' | 'Early Prelims'): number | null {
  const regex = new RegExp(`${phase} \\((\\d+(?:\\.\\d+)?) hrs before Main\\)`, 'i');
  const match = description.match(regex);
  if (match) {
    return Math.round(parseFloat(match[1]) * 60);
  }
  return null;
}
```

**Step 2: Update `normalizeEvents` to use the helper**

```typescript
// Inside the .map() function:
const description = (event as any).description || '';
const prelimsOffset = parseOffset(description, 'Prelims') || 120;
const earlyPrelimsOffset = parseOffset(description, 'Early Prelims') || 210;

const mainCardAt = start ? start.toISOString() : null;
const prelimsAt = start ? subMinutes(start, prelimsOffset).toISOString() : null;
const earlyPrelimsAt = start ? subMinutes(start, earlyPrelimsOffset).toISOString() : null;
```

**Step 3: Commit**

```bash
git add src/lib/ufc/normalize-events.ts
git commit -m "feat: parse dynamic offsets from ICS description"
```

---

### Task 3: Fix Negative Timer in CountdownTicker

**Files:**
- Modify: `src/components/CountdownTicker.tsx`

**Step 1: Update target selection logic**

Ensure that if `now` has passed a target, it immediately looks for the next one.

```typescript
// Replace lines 30-41 approximately:
let target = eventTimes.main;
let phaseName = 'Main Card';

const earlyAt = event.earlyPrelimsAt ? new Date(event.earlyPrelimsAt).getTime() : null;
const prelimsAt = event.prelimsAt ? new Date(event.prelimsAt).getTime() : null;
const mainAt = eventTimes.main.getTime();

if (earlyAt && currentTime < earlyAt) {
  target = new Date(event.earlyPrelimsAt!);
  phaseName = 'Early Prelims';
} else if (prelimsAt && currentTime < prelimsAt) {
  target = new Date(event.prelimsAt!);
  phaseName = 'Prelims';
} else {
  target = eventTimes.main;
  phaseName = 'Main Card';
}
```

**Step 2: Commit**

```bash
git add src/components/CountdownTicker.tsx
git commit -m "fix: ensure ticker target transitions correctly to avoid negative values"
```

---

### Task 4: Animated GitHub Badge UI

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

**Step 1: Update page.tsx with Link and SVG**

```tsx
<a 
  href="https://github.com/clarencechaan/ufc-cal" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="status-widget"
>
  Source: <span>UFC Calendar</span>
  <svg className="github-icon" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
</a>
```

**Step 2: Add CSS in globals.css**

```css
.status-widget {
  display: flex;
  align-items: center;
  gap: 0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 140px;
  cursor: pointer;
  text-decoration: none;
}

.status-widget:hover {
  max-width: 180px;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
}

.github-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.status-widget:hover .github-icon {
  opacity: 1;
  transform: translateX(0);
}
```

**Step 3: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "ui: add animated github badge and link"
```
