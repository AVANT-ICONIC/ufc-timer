export interface RawIcsEvent {
  type: 'VEVENT';
  summary?: string;
  start?: Date;
  end?: Date;
  uid?: string;
  location?: string;
  description?: string;
}

export function parseIcs(data: string): RawIcsEvent[] {
  const events: RawIcsEvent[] = [];
  const lines = data.split(/\r?\n/);
  let currentEvent: Partial<RawIcsEvent> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { type: 'VEVENT' };
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent) events.push(currentEvent as RawIcsEvent);
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) currentEvent.summary = line.substring(8);
      else if (line.startsWith('UID:')) currentEvent.uid = line.substring(4);
      else if (line.startsWith('LOCATION:')) currentEvent.location = line.substring(9);
      else if (line.startsWith('DESCRIPTION:')) currentEvent.description = line.substring(12);
      else if (line.startsWith('DTSTART:')) {
        const val = line.substring(8).replace(':', '');
        currentEvent.start = parseIcsDate(val);
      } else if (line.startsWith('DTEND:')) {
        const val = line.substring(6).replace(':', '');
        currentEvent.end = parseIcsDate(val);
      }
    }
  }

  return events;
}

function parseIcsDate(val: string): Date {
  // Format: 20240310T030000Z or 20240310T030000
  const year = parseInt(val.substring(0, 4));
  const month = parseInt(val.substring(4, 6)) - 1;
  const day = parseInt(val.substring(6, 8));
  const hour = parseInt(val.substring(9, 11));
  const min = parseInt(val.substring(11, 13));
  const sec = parseInt(val.substring(13, 15));

  if (val.endsWith('Z')) {
    return new Date(Date.UTC(year, month, day, hour, min, sec));
  }
  return new Date(year, month, day, hour, min, sec);
}
