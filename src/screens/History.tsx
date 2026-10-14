import { useAppData } from '../lib/store';
import { formatDate, formatDuration, formatTime } from '../lib/dates';
import { hasData, sessionDurationMs } from '../lib/stats';
import { ChevronRight } from '../components/Icons';

export function History() {
  const data = useAppData();
  const sessions = [...data.sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  // Real sessions grouped by month; spreadsheet imports have made-up dates, so they get their own section.
  const groups = new Map<string, typeof sessions>();
  for (const s of sessions.filter((x) => !x.imported)) {
    const key = new Date(s.startedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  const imported = sessions.filter((x) => x.imported);
  if (imported.length) groups.set('From the old spreadsheet', imported);

  return (
    <div className="stack">
      <h1>History</h1>
      {sessions.length === 0 && <div className="empty">No sessions yet. Your first one will show up here.</div>}
      {[...groups.entries()].map(([month, list]) => (
        <section key={month}>
          <h2>{month}</h2>
          <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
            {list.map((s) => {
              const logged = s.exercises.filter(hasData).length;
              return (
                <a key={s.id} className="list-item" href={`#/session/${s.id}`}>
                  <div className="grow">
                    <div className="row wrap">
                      <strong>{s.workoutName}</strong>
                      {s.endedAt === null && <span className="pill">In progress</span>}
                      {s.imported && <span className="pill grey">Spreadsheet · Wk {s.week}</span>}
                    </div>
                    <div className="muted small">
                      {s.imported
                        ? `${logged} exercises`
                        : `${formatDate(s.startedAt)} · ${formatTime(s.startedAt)} · ${formatDuration(sessionDurationMs(s))}${
                            s.exercises.length ? ` · ${logged}/${s.exercises.length} exercises` : ''
                          }`}
                    </div>
                    {s.notes && <div className="small sub" style={{ marginTop: 2 }}>“{s.notes}”</div>}
                  </div>
                  <ChevronRight />
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
