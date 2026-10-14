import { useState } from 'react';
import type { ExerciseLog } from '../types';
import { useAppData } from '../lib/store';
import { deleteSession, finishSession, updateSession } from '../lib/actions';
import { findWorkout } from '../lib/program';
import { getProgram } from '../data/programs';
import { lastPerformance, sessionDurationMs } from '../lib/stats';
import { formatClock, formatDate, formatDuration, fromDateTimeInput, toDateTimeInput } from '../lib/dates';
import { useNow } from '../lib/useNow';
import { navigate } from '../lib/router';
import { ExerciseCard } from '../components/ExerciseCard';
import { BackLink } from '../components/BackLink';

export function SessionScreen({ id }: { id: string }) {
  const data = useAppData();
  const now = useNow();
  const [justFinished, setJustFinished] = useState(false);
  const session = data.sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <div className="empty">
        <p>That session doesn’t exist any more.</p>
        <a className="btn secondary" href="#/history">Go to history</a>
      </div>
    );
  }

  const live = session.endedAt === null;
  const program = getProgram(session.programId);
  const workout = findWorkout(session.programId, session.workoutId);
  const earlier = data.sessions.filter((s) => s.startedAt < session.startedAt);
  const duration = sessionDurationMs(session, now);
  const timesInvalid = !!session.endedAt && new Date(session.endedAt) <= new Date(session.startedAt);

  const edit = (fn: Parameters<typeof updateSession>[1]) => updateSession(session.id, fn);
  const editExercise = (index: number) => (fn: (l: ExerciseLog) => void) => edit((s) => fn(s.exercises[index]));

  const addExercise = () => {
    const name = prompt('Exercise name');
    if (!name?.trim()) return;
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    edit((s) =>
      void s.exercises.push({
        exerciseId: `custom-${slug}`,
        name: name.trim(),
        measure: 'weight',
        sets: [{ done: false }, { done: false }, { done: false }],
        notes: '',
      }),
    );
  };

  const onFinish = () => {
    finishSession(session.id);
    setJustFinished(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = () => {
    const msg = live ? 'Discard this session? Nothing from it will be saved.' : 'Delete this session? This can’t be undone.';
    if (!confirm(msg)) return;
    deleteSession(session.id);
    navigate(live ? '/' : '/history', { replace: true });
  };

  return (
    <div className="stack">
      <BackLink to={live ? '/' : '/history'} label={live ? 'Today' : 'History'} />

      <div className={`card${live ? ' hero' : ''}`}>
        <div className="row between">
          <div className="grow">
            <h1 style={{ margin: 0 }}>{session.workoutName}</h1>
            <div className="sub">
              {program?.name} · Week {session.week} · {formatDate(session.startedAt)}
            </div>
          </div>
        </div>
        {live ? (
          <>
            <div className="timer" style={{ marginTop: 12 }}>{formatClock(duration)}</div>
            {program?.restNote && <div className="sub small">{program.restNote}</div>}
          </>
        ) : session.imported ? (
          <p className="muted" style={{ marginTop: 8 }}>
            Imported from the spreadsheet. The date is approximate and it doesn’t count toward gym hours.
          </p>
        ) : (
          <div style={{ marginTop: 8 }}>
            <span className="pill good">{justFinished ? 'Saved! ' : ''}Finished · {formatDuration(duration)}</span>
          </div>
        )}
      </div>

      {!session.imported && (
        <details className="card" open={timesInvalid || undefined}>
          <summary className="row between" style={{ cursor: 'pointer', listStyle: 'none' }}>
            <strong>Times & week</strong>
            <span className="muted">Edit</span>
          </summary>
          <div className="time-inputs" style={{ marginTop: 12 }}>
            <label className="field">
              <span>Started</span>
              <input
                type="datetime-local"
                value={toDateTimeInput(session.startedAt)}
                onChange={(e) => e.target.value && edit((s) => void (s.startedAt = fromDateTimeInput(e.target.value)))}
              />
            </label>
            {!live && (
              <label className="field">
                <span>Finished</span>
                <input
                  type="datetime-local"
                  value={toDateTimeInput(session.endedAt!)}
                  onChange={(e) => e.target.value && edit((s) => void (s.endedAt = fromDateTimeInput(e.target.value)))}
                />
              </label>
            )}
            {timesInvalid && <p style={{ color: 'var(--danger)' }}>The finish time is before the start time.</p>}
            <label className="field">
              <span>Program week</span>
              <select value={session.week} onChange={(e) => edit((s) => void (s.week = Number(e.target.value)))}>
                {Array.from({ length: program?.weeks ?? 6 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                ))}
              </select>
            </label>
          </div>
        </details>
      )}

      {session.exercises.map((log, i) => (
        <ExerciseCard
          key={`${log.exerciseId}-${i}`}
          log={log}
          template={workout?.exercises.find((e) => e.id === log.exerciseId)}
          previous={lastPerformance(earlier, log.exerciseId)}
          onChange={editExercise(i)}
          onRemove={
            log.exerciseId.startsWith('custom-')
              ? () => confirm(`Remove ${log.name}?`) && edit((s) => void s.exercises.splice(i, 1))
              : undefined
          }
        />
      ))}

      <button type="button" className="btn secondary block" onClick={addExercise}>
        + Add an exercise
      </button>

      <label className="field card">
        <span>Session notes</span>
        <textarea
          placeholder="Energy, mood, anything to remember..."
          value={session.notes}
          onChange={(e) => edit((s) => void (s.notes = e.target.value))}
        />
      </label>

      {live && (
        <button type="button" className="btn block" onClick={onFinish}>
          Finish session · {formatDuration(duration)}
        </button>
      )}
      <button type="button" className="btn danger block" onClick={onDelete}>
        {live ? 'Discard session' : 'Delete session'}
      </button>
    </div>
  );
}
