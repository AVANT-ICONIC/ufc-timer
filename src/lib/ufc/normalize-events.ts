import { UfcEvent } from '@/types/events';
import { addMinutes, subMinutes } from 'date-fns';

function parseOffset(description: string, phase: 'Prelims' | 'Early Prelims'): number | null {
  const regex = new RegExp(`${phase} \\((\\d+(?:\\.\\d+)?) hrs before Main\\)`, 'i');
  const match = description.match(regex);
  if (match) {
    return Math.round(parseFloat(match[1]) * 60);
  }
  return null;
}

export function normalizeEvents(rawEvents: unknown[]): UfcEvent[] {
  return (rawEvents as Array<{ type: string; summary?: string; start?: string | Date; uid?: string; location?: string; description?: string }>)
    .filter((event) => event.type === 'VEVENT')
    .map((event) => {
      const summary = event.summary || '';
      const description = event.description || '';
      const start = event.start ? new Date(event.start) : null;

      // Basic event type detection
      const isFightNight = summary.toLowerCase().includes('fight night');
      const isPpv = !isFightNight && summary.toLowerCase().includes('ufc');

      // The ufc-cal ICS usually marks the start of the MAIN CARD as the start time.
      // We will derive other phases using standard offsets or the parsed description.
      // Early Prelims Default: -210 mins (3.5h) before Main Card
      // Prelims Default: -120 mins (2h) before Main Card

      const prelimsOffset = parseOffset(description, 'Prelims') || 120;
      const earlyPrelimsOffset = parseOffset(description, 'Early Prelims') || 210;

      const mainCardAt = start ? start.toISOString() : null;
      const prelimsAt = start ? subMinutes(start, prelimsOffset).toISOString() : null;
      const earlyPrelimsAt = start ? subMinutes(start, earlyPrelimsOffset).toISOString() : null;
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
        rawDescription: description,
      };
    })
    .sort((a, b) => {
      const dateA = a.mainCardAt ? new Date(a.mainCardAt).getTime() : 0;
      const dateB = b.mainCardAt ? new Date(b.mainCardAt).getTime() : 0;
      return dateA - dateB;
    });
}
