import { useAppData } from '../lib/store';
import { bestWeight, exerciseHistory, summarizeLog } from '../lib/stats';
import { formatDate } from '../lib/dates';
import { programs } from '../data/programs';
import { BackLink } from '../components/BackLink';

export function ExerciseHistory({ exerciseId }: { exerciseId: string }) {
  const data = useAppData();
  const entries = exerciseHistory(data.sessions, exerciseId);
  const template = programs.flatMap((p) => p.workouts.flatMap((w) => w.exercises)).find((e) => e.id === exerciseId);
  const name = template?.name ?? entries[0]?.log.name ?? 'Exercise';
  const best = Math.max(...entries.map((e) => bestWeight(e.log) ?? 0));

  return (
    <div className="stack">
      <BackLink to="/history" label="History" />
      <div>
        <h1>{name}</h1>
        {best > 0 && <p className="sub">Heaviest logged set: {best}kg</p>}
      </div>
      {entries.length === 0 && <div className="empty">Nothing logged for this exercise yet.</div>}
      <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
        {entries.map(({ session, log }, i) => (
          <a key={`${session.id}-${i}`} className="list-item" href={`#/session/${session.id}`}>
            <div className="grow">
              <div className="muted small">
                {session.imported ? `${session.workoutName} · Week ${session.week} (spreadsheet)` : `${formatDate(session.startedAt)} · ${session.workoutName}`}
              </div>
              <div style={{ fontWeight: 600 }}>{summarizeLog(log) || '—'}</div>
              {log.notes && <div className="small sub">“{log.notes}”</div>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
