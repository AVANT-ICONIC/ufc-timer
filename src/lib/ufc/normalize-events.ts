import { UfcEvent } from '@/types/events';
import { addMinutes, subMinutes } from 'date-fns';

export function normalizeEvents(rawEvents: unknown[]): UfcEvent[] {
  return (rawEvents as Array<{ type: string; summary?: string; start?: string | Date; uid?: string; location?: string }>)
    .filter((event) => event.type === 'VEVENT')
    .map((event) => {
      const summary = event.summary || '';
      const start = event.start ? new Date(event.start) : null;

      // Basic event type detection
      const isFightNight = summary.toLowerCase().includes('fight night');
      const isPpv = !isFightNight && summary.toLowerCase().includes('ufc');

      // The ufc-cal ICS usually marks the start of the MAIN CARD as the start time.
      // We will derive other phases using standard offsets for v1.
      // Early Prelims: -210 mins (3.5h) before Main Card
      // Prelims: -120 mins (2h) before Main Card
      // End: +360 mins (6h) after Main Card start

      const mainCardAt = start ? start.toISOString() : null;
      const prelimsAt = start ? subMinutes(start, 120).toISOString() : null;
      const earlyPrelimsAt = start ? subMinutes(start, 210).toISOString() : null;
      const endAt = start ? addMinutes(start, 360).toISOString() : null;


      return {
        id: event.uid || Math.random().toString(36).substring(7),
        eventName: summary,
        eventType: (isPpv ? 'PPV' : isFightNight ? 'Fight Night' : 'Unknown') as UfcEvent['eventType'],
        startsAt: earlyPrelimsAt || prelimsAt || mainCardAt,
        earlyPrelimsAt,
        prelimsAt,
        mainCardAt,
        endAt,
        venue: event.location || null,
        location: event.location || null,
        source: 'ufc-cal' as const,
        confidence: 'medium' as const,
      };
    })
    .sort((a, b) => {
      const dateA = a.mainCardAt ? new Date(a.mainCardAt).getTime() : 0;
      const dateB = b.mainCardAt ? new Date(b.mainCardAt).getTime() : 0;
      return dateA - dateB;
    });
}
