import type { ExerciseLog, Session, SetLog } from '../types';
import { addDays, startOfWeek } from './dates';

export function sessionDurationMs(s: Session, now: number = Date.now()): number {
  if (s.imported) return 0;
  const end = s.endedAt ? new Date(s.endedAt).getTime() : now;
  return Math.max(0, end - new Date(s.startedAt).getTime());
}

/** Sessions that have finished and have real timings. */
export function timedSessions(sessions: Session[]): Session[] {
  return sessions.filter((s) => s.endedAt !== null && !s.imported);
}

export function totalMs(sessions: Session[], from?: Date, to?: Date): number {
  return timedSessions(sessions)
    .filter((s) => {
      const t = new Date(s.startedAt).getTime();
      return (!from || t >= from.getTime()) && (!to || t < to.getTime());
    })
    .reduce((sum, s) => sum + sessionDurationMs(s), 0);
}

export interface WeekBucket {
  start: Date;
  ms: number;
  count: number;
}

/** Hours per week for the last `weeks` weeks (oldest first, current week last). */
export function weeklyTotals(sessions: Session[], weeks: number, now: Date = new Date()): WeekBucket[] {
  const thisWeek = startOfWeek(now);
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(thisWeek, -7 * (weeks - 1 - i));
    const end = addDays(start, 7);
    const inWeek = timedSessions(sessions).filter((s) => {
      const t = new Date(s.startedAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    return { start, ms: inWeek.reduce((sum, s) => sum + sessionDurationMs(s), 0), count: inWeek.length };
  });
}

export function totalsByWorkout(sessions: Session[]): { name: string; ms: number; count: number }[] {
  const map = new Map<string, { name: string; ms: number; count: number }>();
  for (const s of timedSessions(sessions)) {
    const entry = map.get(s.workoutName) ?? { name: s.workoutName, ms: 0, count: 0 };
    entry.ms += sessionDurationMs(s);
    entry.count += 1;
    map.set(s.workoutName, entry);
  }
  return [...map.values()].sort((a, b) => b.ms - a.ms);
}

export function hasData(log: ExerciseLog): boolean {
  return (
    log.sets.some((st) => st.reps != null || st.weight != null || st.seconds != null || st.done) ||
    !!log.notes ||
    !!log.legacy?.reps ||
    !!log.legacy?.weight
  );
}

/** Most recent logged entry for an exercise, optionally ignoring one session (the one in progress). */
export function lastPerformance(
  sessions: Session[],
  exerciseId: string,
  excludeSessionId?: string,
): ExerciseLog | undefined {
  return exerciseHistory(sessions, exerciseId, excludeSessionId)[0]?.log;
}

export function exerciseHistory(
  sessions: Session[],
  exerciseId: string,
  excludeSessionId?: string,
): { session: Session; log: ExerciseLog }[] {
  return sessions
    .filter((s) => s.id !== excludeSessionId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .flatMap((session) =>
      session.exercises.filter((l) => l.exerciseId === exerciseId && hasData(l)).map((log) => ({ session, log })),
    );
}

function setText(st: SetLog, measure: ExerciseLog['measure']): string {
  switch (measure) {
    case 'weight':
      if (st.reps == null && st.weight == null) return '';
      return `${st.reps ?? '?'} × ${st.weight ?? 0}kg`;
    case 'reps':
      return st.reps != null ? `${st.reps}` : '';
    case 'time':
      return st.seconds != null ? `${st.seconds}s` : '';
    case 'check':
      return st.done ? '✓' : '';
  }
}

/** One-line summary such as "10 × 20kg, 8 × 22.5kg" or "4 x 8-10 @ 6kgs". */
export function summarizeLog(log: ExerciseLog): string {
  if (log.legacy && log.sets.length === 0) {
    return [log.legacy.reps, log.legacy.weight].filter(Boolean).join(' @ ');
  }
  return log.sets
    .map((st) => setText(st, log.measure))
    .filter(Boolean)
    .join(', ');
}

/** Heaviest single-set weight logged for an exercise (ignores imported free text). */
export function bestWeight(log: ExerciseLog): number | undefined {
  const weights = log.sets.map((s) => s.weight).filter((w): w is number => w != null);
  return weights.length ? Math.max(...weights) : undefined;
}
