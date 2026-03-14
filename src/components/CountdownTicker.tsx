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

    const phases = [];
    if (earlyAt) phases.push({ time: earlyAt, name: 'Early Prelims' });
    if (prelimsAt) phases.push({ time: prelimsAt, name: 'Prelims' });
    phases.push({ time: mainAt, name: 'Main Card' });

    // Determine Target
    let target = new Date(phases[phases.length - 1].time);
    let phaseName = phases[phases.length - 1].name;

    for (const phase of phases) {
      if (currentTime < phase.time) {
        target = new Date(phase.time);
        phaseName = phase.name;
        break;
      }
    }

    // Progress Calculation
    let progress = 0;
    if (phases.length === 1) {
      progress = currentTime >= mainAt ? 100 : 0;
    } else {
      let currentPhaseIndex = -1;
      for (let i = phases.length - 1; i >= 0; i--) {
        if (currentTime >= phases[i].time) {
          currentPhaseIndex = i;
          break;
        }
      }

      if (currentPhaseIndex === -1) {
        progress = 0;
      } else if (currentPhaseIndex === phases.length - 1) {
        progress = 100;
      } else {
        const startPhase = phases[currentPhaseIndex];
        const endPhase = phases[currentPhaseIndex + 1];
        const segmentPercent = 100 / (phases.length - 1);
        const basePercent = currentPhaseIndex * segmentPercent;
        const segmentProgress = (currentTime - startPhase.time) / (endPhase.time - startPhase.time);
        progress = basePercent + (segmentProgress * segmentPercent);
      }
    }

    return { isLive, target, phaseName, progress, 
             reachedEarly: earlyAt ? currentTime >= earlyAt : false,
             reachedPrelims: prelimsAt ? currentTime >= prelimsAt : false,
             reachedMain: currentTime >= mainAt,
             activePhase: phaseName };
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
