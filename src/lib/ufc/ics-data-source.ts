import { parseIcs } from './ics-parser';
import { UfcDataSource } from './data-source';

export class IcsDataSource implements UfcDataSource {
  private icsUrl: string;

  constructor(url: string = 'https://raw.githubusercontent.com/clarencechaan/ufc-cal/ics/UFC.ics') {
    this.icsUrl = url;
  }

  async getEvents(): Promise<unknown[]> {
    try {
      // Configure revalidation for Next.js fetch
      const response = await fetch(this.icsUrl, {
        next: { revalidate: 3600 } // 1 hour revalidation
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ICS feed: ${response.statusText}`);
      }

      const icsData = await response.text();
      const events = parseIcs(icsData);
      
      return events;
    } catch (error) {
      console.error('IcsDataSource Error:', error);
      return [];
    }
  }
}
