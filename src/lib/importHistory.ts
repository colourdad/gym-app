import type { ExerciseLog, Session } from '../types';
import { march2026History } from '../data/history-march-2026';
import { march2026 } from '../data/programs/march-2026';
import { addDays, parseLocalDate } from './dates';

// The spreadsheet has no dates, so each week's sessions get placeholder dates
// (Mon/Tue/Thu/Fri of that program week) purely to keep them in order.
const DAY_OFFSET: Record<string, number> = { 'upper-1': 0, 'lower-1': 1, 'upper-2': 3, 'lower-2': 4 };

export function buildImportedSessions(): Session[] {
  const program = march2026;
  const start = parseLocalDate(program.startDate);
  const byKey = new Map<string, Session>();

  for (const row of march2026History) {
    const key = `${row.workoutId}:${row.week}`;
    let session = byKey.get(key);
    if (!session) {
      const workout = program.workouts.find((w) => w.id === row.workoutId)!;
      const date = addDays(start, (row.week - 1) * 7 + (DAY_OFFSET[row.workoutId] ?? 0));
      date.setHours(12);
      session = {
        id: `import-${program.id}-${key}`,
        programId: program.id,
        workoutId: workout.id,
        workoutName: workout.name,
        week: row.week,
        startedAt: date.toISOString(),
        endedAt: date.toISOString(),
        exercises: [],
        notes: '',
        imported: true,
      };
      byKey.set(key, session);
    }
    const template = program.workouts
      .find((w) => w.id === row.workoutId)!
      .exercises.find((e) => e.id === row.exerciseId)!;
    const log: ExerciseLog = {
      exerciseId: template.id,
      name: template.name,
      measure: template.measure,
      sets: [],
      notes: row.notes,
      legacy: { reps: row.reps, weight: row.weight },
    };
    session.exercises.push(log);
  }

  return [...byKey.values()];
}
