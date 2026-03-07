import { IcsDataSource } from './ics-data-source';
import { normalizeEvents } from './normalize-events';
import { UfcEvent } from '@/types/events';

export const REVALIDATE_SECONDS = 3600;

export async function getEvents(): Promise<UfcEvent[]> {
  const dataSource = new IcsDataSource();
  const rawEvents = await dataSource.getEvents();
  return normalizeEvents(rawEvents);
}
