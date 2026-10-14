import type { ExerciseLog, ExerciseTemplate, SetLog } from '../types';
import { NumberInput } from './NumberInput';
import { CheckIcon } from './Icons';
import { summarizeLog } from '../lib/stats';

interface Props {
  log: ExerciseLog;
  template?: ExerciseTemplate;
  previous?: ExerciseLog;
  onChange: (fn: (log: ExerciseLog) => void) => void;
  onRemove?: () => void;
}

export function ExerciseCard({ log, template, previous, onChange, onRemove }: Props) {
  // Suggested numbers for a set: same set last time, else the set above in this session.
  const prevSet = (i: number): SetLog | undefined =>
    previous?.sets[i] ?? previous?.sets[previous.sets.length - 1] ?? (i > 0 ? log.sets[i - 1] : undefined);

  const setField = (i: number, patch: Partial<SetLog>) =>
    onChange((l) => {
      l.sets[i] = { ...l.sets[i], ...patch };
    });

  const toggleDone = (i: number) =>
    onChange((l) => {
      const st = l.sets[i];
      const p = prevSet(i);
      if (!st.done && p) {
        // Ticking an empty set fills in last time's numbers, so a repeat is one tap.
        st.reps ??= p.reps;
        st.weight ??= p.weight;
        st.seconds ??= p.seconds;
      }
      st.done = !st.done;
    });

  const single = log.measure !== 'weight';
  const isLegacy = !!log.legacy && log.sets.length === 0;

  return (
    <div className="card exercise">
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div className="grow">
          <h3>{log.name}</h3>
          {template && <div className="target">{template.target}</div>}
          {template?.tip && <div className="tip">{template.tip}</div>}
        </div>
      </div>

      {previous && (
        <div className="last-time">
          Last time: {summarizeLog(previous) || '—'}
          {previous.notes && <> · “{previous.notes}”</>}{' '}
          <a href={`#/exercise/${encodeURIComponent(log.exerciseId)}`}>History</a>
        </div>
      )}

      {isLegacy ? (
        <div className="stack" style={{ marginTop: 12 }}>
          <div className="row">
            <label className="field grow">
              <span>Sets × reps</span>
              <input value={log.legacy!.reps} onChange={(e) => onChange((l) => void (l.legacy!.reps = e.target.value))} />
            </label>
            <label className="field grow">
              <span>Weight</span>
              <input value={log.legacy!.weight} onChange={(e) => onChange((l) => void (l.legacy!.weight = e.target.value))} />
            </label>
          </div>
        </div>
      ) : (
        <>
          <div className={`set-head${single ? ' single' : ''}`}>
            <span className="center">Set</span>
            {log.measure === 'weight' && (
              <>
                <span className="center">Reps</span>
                <span className="center">kg</span>
              </>
            )}
            {log.measure === 'reps' && <span className="center">Reps</span>}
            {log.measure === 'time' && <span className="center">Seconds</span>}
            {log.measure === 'check' && <span />}
            <span />
          </div>
          {log.sets.map((st, i) => {
            const p = prevSet(i);
            return (
              <div key={i} className={`set-row${single ? ' single' : ''}${st.done ? ' done' : ''}`}>
                <span className="num">{i + 1}</span>
                {(log.measure === 'weight' || log.measure === 'reps') && (
                  <NumberInput
                    aria-label={`Set ${i + 1} reps`}
                    value={st.reps}
                    placeholder={p?.reps != null ? String(p.reps) : '–'}
                    onChange={(v) => setField(i, { reps: v })}
                  />
                )}
                {log.measure === 'weight' && (
                  <NumberInput
                    aria-label={`Set ${i + 1} weight in kg`}
                    decimal
                    value={st.weight}
                    placeholder={p?.weight != null ? String(p.weight) : '–'}
                    onChange={(v) => setField(i, { weight: v })}
                  />
                )}
                {log.measure === 'time' && (
                  <NumberInput
                    aria-label={`Set ${i + 1} seconds`}
                    value={st.seconds}
                    placeholder={p?.seconds != null ? String(p.seconds) : '–'}
                    onChange={(v) => setField(i, { seconds: v })}
                  />
                )}
                {log.measure === 'check' && <span className="sub">{log.sets.length > 1 ? `Round ${i + 1}` : 'Done'}</span>}
                <button
                  type="button"
                  className={`check-btn${st.done ? ' on' : ''}`}
                  aria-label={st.done ? `Set ${i + 1} done` : `Mark set ${i + 1} done`}
                  aria-pressed={st.done}
                  onClick={() => toggleDone(i)}
                >
                  <CheckIcon />
                </button>
              </div>
            );
          })}
          <div className="row" style={{ marginTop: 8 }}>
            <button type="button" className="btn ghost small" onClick={() => onChange((l) => void l.sets.push({ done: false }))}>
              + Add set
            </button>
            {log.sets.length > 1 && (
              <button type="button" className="btn ghost small" onClick={() => onChange((l) => void l.sets.pop())}>
                Remove set
              </button>
            )}
            <span className="grow" />
            {onRemove && (
              <button type="button" className="btn ghost small" style={{ color: 'var(--danger)' }} onClick={onRemove}>
                Remove
              </button>
            )}
          </div>
        </>
      )}

      <textarea
        style={{ marginTop: 10, minHeight: 44 }}
        rows={1}
        placeholder="Notes (form, how it felt...)"
        value={log.notes}
        onChange={(e) => onChange((l) => void (l.notes = e.target.value))}
      />
    </div>
  );
}
