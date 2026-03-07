'use client';

import { useEffect, useState } from 'react';
import { UfcEvent } from '@/types/events';

interface UpcomingEventsProps {
  events: UfcEvent[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering a static shell or nothing initially
  if (!mounted) {
    return (
      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="card-badges">
              <div className="badge">--- --</div>
              <div className="badge">--:--</div>
            </div>
            <div className="card-title">{event.eventName}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="events-grid">
      {events.map((event) => {
        const dateObj = event.mainCardAt ? new Date(event.mainCardAt) : null;
        const dateStr = dateObj ? dateObj.toLocaleString(undefined, { month: 'short', day: '2-digit' }).toUpperCase() : 'TBA';
        const timeStr = dateObj ? dateObj.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' }) : '--:--';

        return (
          <div key={event.id} className="event-card">
            <div className="card-badges">
              <div className="badge">{dateStr}</div>
              <div className="badge">{timeStr}</div>
            </div>
            <div className="card-title">{event.eventName}</div>
          </div>
        );
      })}
    </div>
  );
}
