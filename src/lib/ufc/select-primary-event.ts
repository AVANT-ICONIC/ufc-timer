import { UfcEvent } from '@/types/events';

export function selectPrimaryEvent(events: UfcEvent[]): UfcEvent | null {
  if (events.length === 0) return null;

  const now = new Date();

  // 1. Check if an event is currently "LIVE" (startsAt <= now < endAt)
  const liveEvent = events.find((e) => {
    const start = e.startsAt ? new Date(e.startsAt) : null;
    const end = e.endAt ? new Date(e.endAt) : null;
    return start && end && now >= start && now < end;
  });

  if (liveEvent) return liveEvent;

  // 2. Otherwise, find the nearest upcoming event (startsAt > now)
  const upcomingEvent = events.find((e) => {
    const start = e.startsAt ? new Date(e.startsAt) : null;
    return start && start > now;
  });

  return upcomingEvent || events[0]; // Fallback to the first event if none found
}
