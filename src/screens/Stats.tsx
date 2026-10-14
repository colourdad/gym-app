import { useState } from 'react';
import { useAppData } from '../lib/store';
import { timedSessions, totalMs, totalsByWorkout, weeklyTotals } from '../lib/stats';
import { formatDuration, startOfWeek } from '../lib/dates';

const WEEKS = 8;

export function Stats() {
  const data = useAppData();
  const [selected, setSelected] = useState<number | null>(null);
  const now = new Date();
  const total = totalMs(data.sessions);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weeks = weeklyTotals(data.sessions, WEEKS, now);
  const maxMs = Math.max(...weeks.map((w) => w.ms), 1);
  const byWorkout = totalsByWorkout(data.sessions);
  const count = timedSessions(data.sessions).length;
  const avg = count ? total / count : 0;
  const shown = selected ?? WEEKS - 1;

  return (
    <div className="stack">
      <h1>Stats</h1>

      <div className="card hero">
        <div className="sub">Total time in the gym</div>
        <div className="big-num">{(total / 3_600_000).toFixed(1)}<span style={{ fontSize: 28 }}> hours</span></div>
        <div className="sub" style={{ marginTop: 6 }}>across {count} tracked session{count === 1 ? '' : 's'}</div>
      </div>

      <div className="stat-grid">
        <div className="card stat">
          <div className="num">{formatDuration(totalMs(data.sessions, startOfWeek(now)))}</div>
          <div className="label">This week</div>
        </div>
        <div className="card stat">
          <div className="num">{formatDuration(totalMs(data.sessions, monthStart))}</div>
          <div className="label">This month</div>
        </div>
        <div className="card stat">
          <div className="num">{count}</div>
          <div className="label">Sessions</div>
        </div>
        <div className="card stat">
          <div className="num">{formatDuration(avg)}</div>
          <div className="label">Average session</div>
        </div>
      </div>

      <div className="card">
        <div className="row between">
          <h3>Hours per week</h3>
          <span className="muted small">
            {selected === null ? 'This week' : `w/c ${weeks[shown].start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`}:{' '}
            <strong style={{ color: 'var(--ink)' }}>{formatDuration(weeks[shown].ms)}</strong>
          </span>
        </div>
        <div className="bars" role="img" aria-label="Hours in the gym per week for the last 8 weeks">
          {weeks.map((w, i) => (
            <button
              key={i}
              type="button"
              className={`bar-col${i === WEEKS - 1 ? ' current' : ''}${i === selected ? ' selected' : ''}${w.ms === 0 ? ' empty' : ''}`}
              onClick={() => setSelected(i === selected ? null : i)}
              aria-label={`Week of ${w.start.toDateString()}: ${formatDuration(w.ms)}, ${w.count} sessions`}
            >
              {i === shown && w.ms > 0 && (
                <span className="bar-value" style={{ bottom: `calc(${(w.ms / maxMs) * 100}% + 4px)` }}>
                  {formatDuration(w.ms)}
                </span>
              )}
              <div className="bar" style={{ height: `${(w.ms / maxMs) * 100}%` }} />
            </button>
          ))}
        </div>
        <div className="bar-axis">
          {weeks.map((w, i) => (
            <span key={i}>{w.start.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' })}</span>
          ))}
        </div>
        <p className="muted small" style={{ marginTop: 8 }}>Tap a bar to see that week.</p>
      </div>

      {byWorkout.length > 0 && (
        <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
          {byWorkout.map((w) => (
            <div key={w.name} className="list-item">
              <span className="grow">{w.name}</span>
              <span className="muted small">{w.count}×</span>
              <strong>{formatDuration(w.ms)}</strong>
            </div>
          ))}
        </div>
      )}

      <p className="muted small">Sessions imported from the old spreadsheet have no times, so they don’t count toward hours.</p>
    </div>
  );
}
