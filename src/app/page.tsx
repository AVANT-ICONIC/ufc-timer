import { getEvents } from "@/lib/ufc/get-events";
import { selectPrimaryEvent, selectNextEvent } from "@/lib/ufc/select-primary-event";
import CountdownTicker from "@/components/CountdownTicker";
import { format } from "date-fns";

export const revalidate = 3600;

export default async function Home() {
  const events = await getEvents();
  const primaryEvent = selectPrimaryEvent(events);
  const nextEvent = selectNextEvent(events, primaryEvent);

  // Extract fighter names from summary (e.g., "Holloway vs Oliveira")
  const matchupParts = primaryEvent?.eventName.split(" vs ") || ["UFC", "TIMER"];
  const fighter1 = matchupParts[0]?.trim().toUpperCase() || "TBA";
  const fighter2 = matchupParts[1]?.trim().toUpperCase() || "TBA";

  const now = new Date();
  const listEvents = events.filter(e => {
    const start = e.mainCardAt ? new Date(e.mainCardAt) : null;
    return start && start > now && e.id !== primaryEvent?.id;
  });

  return (
    <>
      <header className="header">
        <div className="logo">UFC<span>TIMER</span></div>
        <a 
          href="https://github.com/clarencechaan/ufc-cal" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="status-widget"
        >
          Source: <span>UFC Calendar</span>
          <svg className="github-icon" viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </header>

      <main className="hero">
        <div className="event-tag">{primaryEvent?.eventType || "Main Event Cycle"}</div>
        <h1 className="matchup">
          <strong>{fighter1}</strong> <span>vs</span> <strong>{fighter2}</strong>
        </h1>
        
        <div className="timer-container">
          {primaryEvent ? (
            <CountdownTicker event={primaryEvent} nextEvent={nextEvent ?? undefined} />
          ) : (
            <div className="clock-placeholder">No upcoming events</div>
          )}
        </div>

        <div className="phases-container">
          <div className="phase-track">
            <div id="progress-fill" className="phase-progress-fill" style={{ width: '0%' }}></div>
          </div>
          <div className="milestones-wrapper">
            <div id="mile-early" className="milestone">
              <div className="milestone-label">Early Prelims</div>
              <div className="milestone-dot"></div>
            </div>
            <div id="mile-prelims" className="milestone">
              <div className="milestone-label">Prelims</div>
              <div className="milestone-dot"></div>
            </div>
            <div id="mile-main" className="milestone">
              <div className="milestone-label">Main Card</div>
              <div className="milestone-dot"></div>
            </div>
          </div>
        </div>
      </main>

      {listEvents.length > 0 && (
        <section className="container upcoming-section">
          <div className="section-header">
            <h2>Next Upcoming Events</h2>
            <div className="tz-label">Local Time</div>
          </div>
          <div className="events-grid">
            {listEvents.map((event) => {
              const parts = event.eventName.split(" vs ");
              const f1 = parts[0]?.trim().toUpperCase() || "TBA";
              const f2 = parts[1]?.trim().toUpperCase() || "TBA";
              const eventDate = event.mainCardAt ? new Date(event.mainCardAt) : null;
              
              return (
                <div key={event.id} className="event-card">
                  <div className="card-badges">
                    <span className="badge">{event.eventType}</span>
                  </div>
                  <div className="card-title">
                    {f1} <span style={{ fontStyle: 'italic', opacity: 0.5, fontSize: '0.8em', margin: '0 0.5rem' }}>vs</span> {f2}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--silver)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {eventDate ? format(eventDate, "MMMM d, yyyy") : "TBA"}
                    <br />
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>
                      {eventDate ? format(eventDate, "h:mm a") : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <footer className="footer-credit">
        UFC TIMER &bull; ALL TIMES LOCAL &bull; DATA FROM UFC CALENDAR SOURCE
      </footer>
    </>
  );
}
