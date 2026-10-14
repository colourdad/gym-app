import type { ExerciseLog, Session, SetLog, Settings, WorkoutTemplate } from '../types';
import { getData, updateData } from './store';
import { newId } from './id';
import { activeProgram, findWorkout, programWeek } from './program';
import { lastPerformance } from './stats';

export function activeSession(): Session | undefined {
  return getData().sessions.find((s) => s.endedAt === null);
}

function emptySet(): SetLog {
  return { done: false };
}

export function buildExerciseLogs(workout: WorkoutTemplate, sessions: Session[]): ExerciseLog[] {
  return workout.exercises.map((ex) => {
    const last = lastPerformance(sessions, ex.id);
    const count = Math.max(ex.sets, last?.sets.length ?? 0);
    return {
      exerciseId: ex.id,
      name: ex.name,
      measure: ex.measure,
      sets: Array.from({ length: count }, emptySet),
      notes: '',
    };
  });
}

/** Start a new running session. Returns its id. */
export function startSession(programId: string, workoutId: string): string {
  const existing = activeSession();
  if (existing) return existing.id;
  const workout = findWorkout(programId, workoutId);
  if (!workout) throw new Error(`Unknown workout ${workoutId}`);
  const id = newId();
  updateData((d) => {
    const program = activeProgram(d);
    d.sessions.push({
      id,
      programId,
      workoutId,
      workoutName: workout.name,
      week: program.id === programId ? programWeek(d, program) : 1,
      startedAt: new Date().toISOString(),
      endedAt: null,
      exercises: buildExerciseLogs(workout, d.sessions),
      notes: '',
    });
  });
  return id;
}

export function updateSession(id: string, fn: (s: Session) => void): void {
  updateData((d) => {
    const s = d.sessions.find((x) => x.id === id);
    if (s) fn(s);
  });
}

export function finishSession(id: string): void {
  updateSession(id, (s) => {
    s.endedAt = new Date().toISOString();
  });
}

export function deleteSession(id: string): void {
  updateData((d) => {
    d.sessions = d.sessions.filter((s) => s.id !== id);
  });
}

export function updateSettings(patch: Partial<Settings>): void {
  updateData((d) => {
    d.settings = { ...d.settings, ...patch };
  });
}

/** For when she forgot to start the timer: creates a finished session she can then adjust. */
export function logPastSession(programId: string, workoutId: string): string {
  const workout = findWorkout(programId, workoutId);
  if (!workout) throw new Error(`Unknown workout ${workoutId}`);
  const id = newId();
  const end = new Date();
  end.setSeconds(0, 0);
  const start = new Date(end.getTime() - 60 * 60 * 1000);
  updateData((d) => {
    const program = activeProgram(d);
    d.sessions.push({
      id,
      programId,
      workoutId,
      workoutName: workout.name,
      week: program.id === programId ? programWeek(d, program) : 1,
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      exercises: buildExerciseLogs(workout, d.sessions),
      notes: '',
    });
  });
  return id;
}
