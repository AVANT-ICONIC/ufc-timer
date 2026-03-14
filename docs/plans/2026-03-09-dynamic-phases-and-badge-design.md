# Design: Dynamic Phases & Animated GitHub Badge

## Goal
Fix the negative timer issue by dynamically parsing event phases from the ICS feed and enhance the UI with an interactive GitHub badge.

## Architecture

### 1. Data Layer (Normalization)
- **Source**: `src/lib/ufc/normalize-events.ts`
- **Change**: Replace hardcoded offsets with Regex parsing of the `description` field.
- **Regex Patterns**:
  - Prelims: `/Prelims \((\d+) hrs before Main\)/i`
  - Early Prelims: `/Early Prelims \((\d+(?:\.\d+)?) hrs before Main\)/i`
- **Fallback**: Maintain current defaults (210/120 mins) if parsing fails.

### 2. Logic Layer (Timer)
- **Source**: `src/components/CountdownTicker.tsx`
- **Change**: 
  - Ensure the `target` time logic correctly "rolls over" to the next phase as soon as the current one starts.
  - Implement a safety check: if `diff < 0`, force the state to re-evaluate the next phase.

### 3. UI Layer (Badge)
- **Source**: `src/app/page.tsx` & `src/app/globals.css`
- **Action**:
  - Wrap `.status-widget` in `<a>` link to `https://github.com/clarencechaan/ufc-cal`.
  - **CSS Animation**:
    - `.status-widget` expands on hover (`max-width` transition).
    - GitHub SVG icon fades/slides in at the end of the badge.

## Testing Strategy
- **Reproduction**: Mock an event with a past phase start to verify the negative timer is gone.
- **Visual Check**: Hover over the badge to confirm expansion and icon animation.
