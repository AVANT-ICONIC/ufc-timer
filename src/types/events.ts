export type UfcEvent = {
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
