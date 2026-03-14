'use client';

import { useState, useEffect, useMemo } from 'react';
import { UfcEvent } from '@/types/events';

interface CountdownTickerProps {
  event: UfcEvent;
}

export default function CountdownTicker({ event }: CountdownTickerProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const eventTimes = useMemo(() => ({
    start: event.earlyPrelimsAt ? new Date(event.earlyPrelimsAt) : (event.prelimsAt ? new Date(event.prelimsAt) : new Date(event.mainCardAt!)),
    prelims: event.prelimsAt ? new Date(event.prelimsAt) : null,
    main: new Date(event.mainCardAt!),
    end: event.endAt ? new Date(event.endAt) : new Date(new Date(event.mainCardAt!).getTime() + 6 * 60 * 60 * 1000),
  }), [event]);

  const state = useMemo(() => {
    const currentTime = now.getTime();
    const isLive = currentTime >= eventTimes.main.getTime() && currentTime < eventTimes.end.getTime();
    
    const earlyAt = event.earlyPrelimsAt ? new Date(event.earlyPrelimsAt).getTime() : null;
    const prelimsAt = eventTimes.prelims?.getTime() || null;
    const mainAt = eventTimes.main.getTime();

    // Strict Target Determination (what the timer numbers count down to)
    let target = new Date(mainAt);
    let phaseName = 'Main Card';

    if (earlyAt && currentTime < earlyAt) {
      target = new Date(earlyAt);
      phaseName = 'Early Prelims';
    } else if (prelimsAt && currentTime < prelimsAt) {
      target = new Date(prelimsAt);
      phaseName = 'Prelims';
    }

    // Visual Progress Bar Determination 
    // The UI reliably has 3 dots (0%, 50%, 100%). We simulate missing phases right before real ones.
    const visEarly = earlyAt || (prelimsAt ? prelimsAt - 3600000 : mainAt - 7200000);
    const visPrelim = prelimsAt || mainAt - 3600000;

    let progress = 0;
    if (currentTime < visEarly) {
      progress = 0;
    } else if (currentTime < visPrelim) {
      progress = ((currentTime - visEarly) / (visPrelim - visEarly)) * 50;
    } else if (currentTime < mainAt) {
      progress = 50 + ((currentTime - visPrelim) / (mainAt - visPrelim)) * 50;
    } else {
      progress = 100;
    }

    return { 
      isLive, 
      target, 
      phaseName, 
      progress, 
      reachedEarly: currentTime >= visEarly,
      reachedPrelims: currentTime >= visPrelim,
      reachedMain: currentTime >= mainAt,
      activePhase: phaseName 
    };
  }, [now, eventTimes, event]);

  const diff = state.target.getTime() - now.getTime();
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  // Milestone Classes
  useEffect(() => {
    const updateMilestones = () => {
      document.getElementById('mile-early')?.classList.toggle('reached', state.reachedEarly);
      document.getElementById('mile-prelims')?.classList.toggle('reached', state.reachedPrelims);
      document.getElementById('mile-main')?.classList.toggle('reached', state.reachedMain);
      
      document.getElementById('mile-early')?.classList.toggle('active', !state.reachedEarly && state.activePhase === 'Early Prelims');
      document.getElementById('mile-prelims')?.classList.toggle('active', !state.reachedPrelims && state.activePhase === 'Prelims');
      document.getElementById('mile-main')?.classList.toggle('active', !state.reachedMain && state.activePhase === 'Main Card');

      const fill = document.getElementById('progress-fill');
      if (fill) fill.style.width = `${state.progress}%`;
    };
    updateMilestones();
  }, [state]);

  if (state.isLive) {
    return <div className="live-now">Live Now</div>;
  }

  return (
    <div className="clock">
      {d > 0 ? (
        <>
          <div className="clock-unit">
            <div className="clock-value">{d.toString().padStart(2, '0')}</div>
            <div className="clock-label">DAYS</div>
          </div>
          <div className="clock-sep">:</div>
          <div className="clock-unit">
            <div className="clock-value">{h.toString().padStart(2, '0')}</div>
            <div className="clock-label">HOURS</div>
          </div>
        </>
      ) : h > 0 ? (
        <>
          <div className="clock-unit">
            <div className="clock-value">{h.toString().padStart(2, '0')}</div>
            <div className="clock-label">HOURS</div>
          </div>
          <div className="clock-sep">:</div>
          <div className="clock-unit">
            <div className="clock-value">{m.toString().padStart(2, '0')}</div>
            <div className="clock-label">MINUTES</div>
          </div>
        </>
      ) : (
        <>
          <div className="clock-unit">
            <div className="clock-value">{m.toString().padStart(2, '0')}</div>
            <div className="clock-label">MINUTES</div>
          </div>
          <div className="clock-sep">:</div>
          <div className="clock-unit">
            <div className="clock-value">{s.toString().padStart(2, '0')}</div>
            <div className="clock-label">SECONDS</div>
          </div>
        </>
      )}
    </div>
  );
}
