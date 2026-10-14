import { useAppData } from '../lib/store';
import { activeSession, startSession } from '../lib/actions';
import { activeProgram, findWorkout, plannedForDay, programWeek } from '../lib/program';
import { addDays, DAY_NAMES, formatDuration, startOfDay, startOfWeek } from '../lib/dates';
import { totalMs, timedSessions } from '../lib/stats';
import { navigate } from '../lib/router';
import { USER_NAME } from '../config';
import { ChevronRight, PlayIcon } from '../components/Icons';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Today() {
  const data = useAppData();
  const program = activeProgram(data);
  const today = new Date();
  const planned = plannedForDay(program, today);
  const week = programWeek(data, program, today);
  const live = activeSession();
  const weekStart = startOfWeek(today);
  const sessionsThisWeek = timedSessions(data.sessions).filter((s) => new Date(s.startedAt) >= weekStart);

  const start = (workoutId: string) => {
    const id = startSession(program.id, workoutId);
    navigate(`/session/${id}`);
  };

  return (
    <div className="stack">
      <div>
        <div className="muted">
          {DAY_NAMES[today.getDay()]} · {program.name} · Week {week} of {program.weeks}
        </div>
        <h1>
          {greeting()}, {USER_NAME}
        </h1>
      </div>

      {live ? (
        <a className="card hero" href={`#/session/${live.id}`}>
          <div className="row between">
            <div>
              <div className="sub">In progress</div>
              <h2 style={{ margin: '2px 0 0' }}>{live.workoutName}</h2>
            </div>
            <span className="btn light small">Continue</span>
          </div>
        </a>
      ) : planned && planned.workoutIds.length > 0 ? (
        <div className="card hero">
          <div className="sub">Today’s plan</div>
          <h2 style={{ margin: '2px 0 12px' }}>{planned.label}</h2>
          <div className="stack">
            {planned.workoutIds.map((wid) => {
              const w = findWorkout(program.id, wid);
              if (!w) return null;
              return (
                <button key={wid} type="button" className="btn light block" onClick={() => start(wid)}>
                  <PlayIcon /> Start {w.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card hero">
          <div className="sub">Today’s plan</div>
          <h2 style={{ margin: '2px 0 4px' }}>Rest day</h2>
          <p className="sub">Recover well. Fancy training anyway? Pick any workout from the plan.</p>
        </div>
      )}

      {!live && (
        <a className="card row between" href="#/plan">
          <span>Start a different workout</span>
          <ChevronRight />
        </a>
      )}

      <h2>This week</h2>
      <div className="week-strip">
        {Array.from({ length: 7 }, (_, i) => {
          const day = addDays(weekStart, i);
          const isToday = startOfDay(day).getTime() === startOfDay(today).getTime();
          const done = sessionsThisWeek.some((s) => startOfDay(new Date(s.startedAt)).getTime() === day.getTime());
          return (
            <div key={i} className={`day${isToday ? ' today' : ''}`} title={plannedForDay(program, day)?.label}>
              {DAY_NAMES[day.getDay()].slice(0, 1)}
              <div className={`dot${done ? ' done' : ''}`} />
            </div>
          );
        })}
      </div>

      <div className="stat-grid">
        <div className="card stat">
          <div className="num">{formatDuration(totalMs(data.sessions, weekStart))}</div>
          <div className="label">{sessionsThisWeek.length} session{sessionsThisWeek.length === 1 ? '' : 's'} this week</div>
        </div>
        <a className="card stat" href="#/stats">
          <div className="num">{(totalMs(data.sessions) / 3_600_000).toFixed(1)}h</div>
          <div className="label">Total time logged</div>
        </a>
      </div>
    </div>
  );
}
