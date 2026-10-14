import { useAppData } from '../lib/store';
import { activeProgram, programWeek } from '../lib/program';
import { DAY_NAMES } from '../lib/dates';
import { ChevronRight } from '../components/Icons';

export function Plan() {
  const data = useAppData();
  const program = activeProgram(data);
  const todayIdx = new Date().getDay();
  // Monday first.
  const schedule = [...program.schedule].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7));

  return (
    <div className="stack">
      <div>
        <div className="muted">Week {programWeek(data, program)} of {program.weeks}</div>
        <h1>{program.name}</h1>
        {program.restNote && <p className="sub">{program.restNote}</p>}
      </div>

      {schedule.length > 0 && (
        <>
          <h2>Weekly flow</h2>
          <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
            {schedule.map((d) => (
              <div key={d.day} className="list-item">
                <span style={{ width: 92, fontWeight: d.day === todayIdx ? 700 : 500, color: d.day === todayIdx ? 'var(--accent)' : undefined }}>
                  {DAY_NAMES[d.day]}
                </span>
                <span className="grow sub">{d.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Workouts</h2>
      {program.workouts.map((w) => (
        <a key={w.id} className="card row" href={`#/plan/${program.id}/${w.id}`}>
          <div className="grow">
            <div className="row wrap">
              <h3>{w.name}</h3>
              {w.optional && <span className="pill grey">Optional</span>}
            </div>
            <div className="muted">
              {w.subtitle ? `${w.subtitle} · ` : ''}
              {w.exercises.length > 0 ? `${w.exercises.length} exercises` : 'Activity'}
            </div>
          </div>
          <ChevronRight />
        </a>
      ))}
    </div>
  );
}
