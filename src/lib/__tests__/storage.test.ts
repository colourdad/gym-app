import { describe, expect, it } from 'vitest';
import { buildImportedSessions } from '../importHistory';
import { createInitialData, CURRENT_VERSION, migrate } from '../storage';
import { programs } from '../../data/programs';

describe('spreadsheet import', () => {
  const sessions = buildImportedSessions();

  it('creates one session per workout per week that has data', () => {
    const keys = sessions.map((s) => `${s.workoutId}:${s.week}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(sessions.every((s) => s.imported && s.endedAt)).toBe(true);
  });

  it('keeps the original values', () => {
    const wk1 = sessions.find((s) => s.workoutId === 'lower-1' && s.week === 1)!;
    const hip = wk1.exercises.find((e) => e.exerciseId === 'hip-thrust')!;
    expect(hip.legacy).toEqual({ reps: '4 x 8', weight: '50kg' });
  });

  it('only references exercises that exist in the March program', () => {
    const march = programs.find((p) => p.id === 'mar-2026')!;
    const ids = new Set(march.workouts.flatMap((w) => w.exercises.map((e) => e.id)));
    for (const s of sessions) for (const e of s.exercises) expect(ids.has(e.exerciseId)).toBe(true);
  });
});

describe('migrate', () => {
  it('accepts current data and fills missing settings', () => {
    const data = createInitialData();
    const partial = { ...data, settings: { activeProgramId: 'oct-2026' } };
    const out = migrate(JSON.parse(JSON.stringify(partial)));
    expect(out.version).toBe(CURRENT_VERSION);
    expect(out.settings.programStartDates).toEqual({});
  });

  it('rejects things that are not app data', () => {
    expect(() => migrate({ foo: 1 })).toThrow();
    expect(() => migrate({ ...createInitialData(), version: CURRENT_VERSION + 1 })).toThrow(/newer version/);
  });
});

describe('programs', () => {
  it('have unique ids and valid schedules', () => {
    for (const p of programs) {
      const workoutIds = new Set(p.workouts.map((w) => w.id));
      expect(workoutIds.size).toBe(p.workouts.length);
      for (const day of p.schedule) for (const id of day.workoutIds) expect(workoutIds.has(id)).toBe(true);
      for (const w of p.workouts) {
        const exIds = w.exercises.map((e) => e.id);
        expect(new Set(exIds).size).toBe(exIds.length);
      }
    }
  });
});
