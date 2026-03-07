# Design Document: FIGHTCLOCK

**Date:** 2026-03-07  
**Status:** Approved  
**Topic:** UFC Countdown Web Application (Next.js + TypeScript + App Router)

## 1. Overview
FIGHTCLOCK is a high-fidelity, premium UFC countdown website designed for fans in the `Europe/Berlin` timezone. It automatically fetches UFC event data from a public ICS feed, normalizes it, and provides a real-time, phase-aware countdown experience (Early Prelims -> Prelims -> Main Card -> LIVE NOW).

## 2. Goals & Constraints
- **Zero-Cost Core:** Free hosting on Vercel, free ICS data source (`ufc-cal`), client-side processing for live ticking.
- **High Design Fidelity:** Strict adherence to "Black Arena" broadcast aesthetic (brutal/brutalist, radial red beam, grain texture, ultra-bold typography).
- **Timezone Focus:** All event times rendered in `Europe/Berlin`.
- **Phase Logic:** Gracefully handle missing "Early Prelims" or "Prelims" timestamps.
- **Performance:** Server-side fetching with 1-hour revalidation; minimal client-side JS (only for the countdown ticker).

## 3. Architecture

### 3.1 Data Pipeline (Server-Side)
- **Source:** `ufc-cal` ICS feed.
- **Parser:** `node-ical` for robust `.ics` parsing.
- **Adapter Pattern:** A microscopic `UfcDataSource` interface with an `IcsDataSource` implementation.
- **Normalization:** `lib/ufc/normalize.ts` maps raw feed data to a strict `UfcEvent` type.
- **Caching:** `UFC_EVENTS_REVALIDATE_SECONDS = 3600` (1 hour) using Next.js `fetch` revalidation.

### 3.2 Component Strategy
- **Server Components:** Main page layout, upcoming events grid, logo, footer.
- **Client Component:** `<CountdownTicker />` handles the 1s interval, unit switching (Days/Hrs, Hrs/Min, Min/Sec), and phase-based UI updates (progress bar, "LIVE NOW" state).

### 3.3 Data Model
```ts
type UfcEvent = {
  id: string;
  eventName: string;
  eventType: 'PPV' | 'Fight Night' | 'Unknown';
  startsAt: string | null;
  earlyPrelimsAt: string | null;
  prelimsAt: string | null;
  mainCardAt: string | null;
  endAt: string | null;
  venue: string | null;
  location: string | null;
  source: 'ufc-cal';
  confidence: 'high' | 'medium' | 'low';
};
```

## 4. Design DNA
- **Background:** `#050505` radial gradient with a rotating `rgba(255,0,51,0.05)` conic beam.
- **Texture:** Subtle SVG noise/grain overlay.
- **Typography:** Ultra-bold, uppercase, tabular numerals for the clock.
- **Accents:** Sharp `#ff0033` red for "CLOCK", "LIVE NOW", and progress bar.
- **Progress Bar:** Glowing red fill with a segmented animation (Early -> Prelims -> Main).

## 5. Deployment
- **Platform:** Vercel (Next.js 15 optimization).
- **Rule:** Deploy only after explicit user confirmation.

## 6. Validation Plan
- [ ] Run `lint` and `typecheck`.
- [ ] Verify `Europe/Berlin` time conversions.
- [ ] Verify 2-unit countdown logic (Days+Hours, Hours+Mins, etc.).
- [ ] Verify "LIVE NOW" transition.
- [ ] Test mobile responsiveness (no overflow, scaled typography).
