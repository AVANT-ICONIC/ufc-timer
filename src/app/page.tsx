import { getEvents } from "@/lib/ufc/get-events";
import { selectPrimaryEvent } from "@/lib/ufc/select-primary-event";
import CountdownTicker from "@/components/CountdownTicker";

export default async function Home() {
  const events = await getEvents();
  const primaryEvent = selectPrimaryEvent(events);
  const upcomingEvents = events.filter(e => e.id !== primaryEvent?.id).slice(0, 3);

  // Extract fighter names from summary (e.g., "Holloway vs Oliveira")
  const matchupParts = primaryEvent?.eventName.split(" vs ") || ["FIGHT", "CLOCK"];
  const fighter1 = matchupParts[0]?.trim().toUpperCase() || "TBA";
  const fighter2 = matchupParts[1]?.trim().toUpperCase() || "TBA";

  return (
    <>
      <header className="header">
        <div className="logo">FIGHT<span>CLOCK</span></div>
        <div className="status-widget">
          Source: <span>UFC Calendar</span>
        </div>
      </header>

      <main className="hero">
        <div className="event-tag">{primaryEvent?.eventType || "Main Event Cycle"}</div>
        <h1 className="matchup">
          <strong>{fighter1}</strong> <span>vs</span> <strong>{fighter2}</strong>
        </h1>
        
        <div className="timer-container">
          {primaryEvent ? (
            <CountdownTicker event={primaryEvent} />
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

      <section className="upcoming-section">
        <div className="section-header">
          <h2>Upcoming</h2>
          <div className="tz-label">Berlin Time</div>
        </div>
        <div className="events-grid">
          {upcomingEvents.map((event) => {
            const dateObj = event.mainCardAt ? new Date(event.mainCardAt) : null;
            const dateStr = dateObj ? dateObj.toLocaleString('de-DE', { month: 'short', day: '2-digit' }).toUpperCase() : 'TBA';
            const timeStr = dateObj ? dateObj.toLocaleString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '--:--';

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
      </section>

      <footer className="footer-credit">
        UNFORCED ERRORS // 2024
      </footer>
    </>
  );
}
