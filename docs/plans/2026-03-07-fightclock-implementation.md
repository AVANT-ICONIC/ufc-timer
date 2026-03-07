# FIGHTCLOCK Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready UFC countdown website (FIGHTCLOCK) with Next.js 15, strict design fidelity, and automated ICS data fetching.

**Architecture:** Server-side fetching/normalization with 1-hour revalidation. A single client-side `<CountdownTicker />` for real-time updates. Micro-adapter pattern for data sources.

**Tech Stack:** Next.js 15, TypeScript, node-ical, date-fns-tz, Plain CSS.

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

**Step 1: Scaffold Next.js 15**
Run: `npx create-next-app@latest . --ts --app --no-tailwind --eslint --src-dir false --import-alias "@/*" --yes`

**Step 2: Clean up default Next.js 15 boilerplate**
Remove `public/` assets and default CSS in `app/page.tsx` and `app/globals.css`.

**Step 3: Verify scaffold**
Run: `npm run build`
Expected: Success

**Step 4: Commit**
```bash
git add .
git commit -m "chore: scaffold Next.js 15 project"
```

---

### Task 2: Types & Data Source

**Files:**
- Create: `types/events.ts`
- Create: `lib/ufc/data-source.ts`
- Create: `lib/ufc/ics-data-source.ts`

**Step 1: Install dependencies**
Run: `npm install node-ical date-fns date-fns-tz`

**Step 2: Define `UfcEvent` type**
In `types/events.ts`, define the strict event model as described in the design doc.

**Step 3: Implement `UfcDataSource` interface**
In `lib/ufc/data-source.ts`:
```ts
export interface UfcDataSource {
  getEvents(): Promise<any[]>;
}
```

**Step 4: Implement `IcsDataSource`**
In `lib/ufc/ics-data-source.ts`, fetch the ICS feed from `https://raw.githubusercontent.com/skeggse/ufc-cal/refs/heads/master/ufc.ics`.

**Step 5: Commit**
```bash
git add types/ lib/
git commit -m "feat: add event types and ICS data source"
```

---

### Task 3: Normalization & Selection Logic

**Files:**
- Create: `lib/ufc/normalize-events.ts`
- Create: `lib/ufc/select-primary-event.ts`
- Create: `lib/ufc/get-events.ts`

**Step 1: Implement `normalizeEvents`**
Map raw ICS data to `UfcEvent`, parsing phases from the event description or summary if available, otherwise defaulting to standard offsets. Use `Europe/Berlin` for all date logic.

**Step 2: Implement `selectPrimaryEvent`**
Logic to find the nearest upcoming event or the currently live event.

**Step 3: Implement `getEvents` (The Orchestrator)**
Combine fetching, parsing, and normalization. Add `revalidate: 3600` to the fetch call.

**Step 4: Commit**
```bash
git add lib/ufc/
git commit -m "feat: implement normalization and event selection logic"
```

---

### Task 4: Design DNA & Layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Step 1: Port CSS Variables and Base Styles**
Port the `:root` variables and background animations from the reference HTML.

**Step 2: Implement Arena Background**
Add the `.arena-bg`, `.beam`, and `.noise` styles and structure to `app/layout.tsx`.

**Step 3: Commit**
```bash
git add app/globals.css app/layout.tsx
git commit -m "style: apply arena background and design DNA"
```

---

### Task 5: Countdown Ticker (Client Component)

**Files:**
- Create: `components/CountdownTicker.tsx`

**Step 1: Implement 1s Ticker Logic**
Use `setInterval` to update the remaining time.

**Step 2: Implement 2-unit Display Logic**
Logic to switch between Days+Hours, Hours+Mins, and Mins+Secs.

**Step 3: Implement Phase Progress Bar**
Port the glowing progress fill and milestone logic.

**Step 4: Implement LIVE NOW state**
Switch UI when the event is live.

**Step 5: Commit**
```bash
git add components/
git commit -m "feat: implement phase-aware countdown ticker"
```

---

### Task 6: Main Page Implementation

**Files:**
- Modify: `app/page.tsx`

**Step 1: Fetch Data on Server**
Call `getEvents()` and `selectPrimaryEvent()`.

**Step 2: Render Hero Section**
Fighter names, "vs" separator, and `<CountdownTicker />`.

**Step 3: Render Upcoming Section**
Grid of future event cards.

**Step 4: Commit**
```bash
git add app/page.tsx
git commit -m "feat: complete main page implementation"
```

---

### Task 7: Final Validation

**Step 1: Lint & Typecheck**
Run: `npm run lint` and `npx tsc --noEmit`

**Step 2: Build Check**
Run: `npm run build`

**Step 3: Verification**
Verify timezone display, mobile layout, and phase transitions.

**Step 4: Commit**
```bash
git commit -m "chore: final build and validation pass"
```
