import { describe, expect, it } from 'vitest';
import type { Session } from '../../types';
import { exerciseHistory, lastPerformance, summarizeLog, totalMs, weeklyTotals } from '../stats';

function session(partial: Partial<Session>): Session {
  return {
    id: Math.random().toString(36),
    programId: 'oct-2026',
    workoutId: 'lower-1',
    workoutName: 'Lower Body 1',
    week: 1,
    startedAt: '2026-10-05T08:00:00.000Z',
    endedAt: '2026-10-05T09:00:00.000Z',
    exercises: [],
    notes: '',
    ...partial,
  };
}

describe('hours', () => {
  it('sums finished sessions and ignores running and imported ones', () => {
    const sessions = [
      session({}),
      session({ startedAt: '2026-10-06T08:00:00.000Z', endedAt: '2026-10-06T08:30:00.000Z' }),
      session({ endedAt: null }),
      session({ imported: true }),
    ];
    expect(totalMs(sessions)).toBe(90 * 60 * 1000);
  });

  it('buckets by week, current week last', () => {
    const now = new Date('2026-10-14T12:00:00');
    const buckets = weeklyTotals(
      [session({ startedAt: new Date('2026-10-13T08:00:00').toISOString(), endedAt: new Date('2026-10-13T09:00:00').toISOString() })],
      4,
      now,
    );
    expect(buckets).toHaveLength(4);
    expect(buckets[3].ms).toBe(3_600_000);
    expect(buckets[2].ms).toBe(0);
  });
});

describe('exercise history', () => {
  const older = session({
    id: 'a',
    startedAt: '2026-10-01T08:00:00.000Z',
    exercises: [{ exerciseId: 'rdl', name: 'RDL', measure: 'weight', notes: '', sets: [{ reps: 10, weight: 20, done: true }] }],
  });
  const newer = session({
    id: 'b',
    startedAt: '2026-10-08T08:00:00.000Z',
    exercises: [{ exerciseId: 'rdl', name: 'RDL', measure: 'weight', notes: '', sets: [{ reps: 8, weight: 22.5, done: true }] }],
  });
  const emptyOne = session({
    id: 'c',
    startedAt: '2026-10-09T08:00:00.000Z',
    exercises: [{ exerciseId: 'rdl', name: 'RDL', measure: 'weight', notes: '', sets: [{ done: false }] }],
  });

  it('returns the most recent entry that has data', () => {
    expect(lastPerformance([older, newer, emptyOne], 'rdl')?.sets[0].weight).toBe(22.5);
    expect(lastPerformance([older, newer], 'rdl', 'b')?.sets[0].weight).toBe(20);
    expect(exerciseHistory([older, newer, emptyOne], 'rdl')).toHaveLength(2);
  });

  it('summarises per-set and legacy logs', () => {
    expect(summarizeLog(newer.exercises[0])).toBe('8 × 22.5kg');
    expect(
      summarizeLog({ exerciseId: 'x', name: 'x', measure: 'weight', notes: '', sets: [], legacy: { reps: '4 x 8', weight: '50kg' } }),
    ).toBe('4 x 8 @ 50kg');
  });
});
