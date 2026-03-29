import { getEvents } from './src/lib/ufc/get-events.ts';
import { selectPrimaryEvent } from './src/lib/ufc/select-primary-event.ts';
import { format } from 'date-fns';

async function check() {
  const events = await getEvents();
  const primary = selectPrimaryEvent(events);
  const now = new Date();

  console.log('--- Current Info ---');
  console.log('Today is:', format(now, 'EEEE, MMMM d, yyyy HH:mm'));
  
  if (primary) {
    console.log('\n--- Primary Event ---');
    console.log('Name:', primary.eventName);
    console.log('Main Card (UTC):', primary.mainCardAt);
    if (primary.mainCardAt) {
      const start = new Date(primary.mainCardAt);
      const diff = start.getTime() - now.getTime();
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      console.log('Countdown:', d, 'DAYS', h, 'HOURS', m, 'MINS');
    }
  }

  const moicano = events.find(e => e.eventName.toUpperCase().includes('MOICANO'));
  if (moicano) {
    console.log('\n--- Moicano Event ---');
    console.log('Name:', moicano.eventName);
    console.log('Main Card (UTC):', moicano.mainCardAt);
  }
}

check().catch(console.error);
