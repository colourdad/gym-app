import type { Program } from '../../types';

// The March–June 2026 block. Kept so the history imported from the old
// spreadsheet still has names and targets to show against.
export const march2026: Program = {
  id: 'mar-2026',
  name: 'March – June 2026',
  startDate: '2026-03-02',
  weeks: 6,
  restNote: 'Take 60–90 seconds rest between each set/exercise.',
  schedule: [],
  workouts: [
    {
      id: 'upper-1',
      name: 'Upper Body 1',
      subtitle: 'Chest, shoulders, triceps',
      exercises: [
        { id: 'db-incline-press', name: 'DB Incline Chest Press', target: '4 × 8-10', sets: 4, measure: 'weight' },
        { id: 'db-shoulder-press', name: 'DB Shoulder Press', target: '4 × 8-10', sets: 4, measure: 'weight' },
        { id: 'tricep-pushdown', name: 'Tricep Pushdown', target: '3 × 10-12', sets: 3, measure: 'weight' },
        { id: 'lateral-raise', name: 'DB Lateral Raises', target: '3 × 12-15', sets: 3, measure: 'weight' },
        { id: 'face-pulls', name: 'Face Pulls or Push-Ups', target: '3 × 10', sets: 3, measure: 'weight' },
      ],
    },
    {
      id: 'lower-1',
      name: 'Lower Body 1',
      subtitle: 'Glute & posterior chain',
      exercises: [
        { id: 'hip-thrust', name: 'Hip Thrust', target: '4 × 8', sets: 4, measure: 'weight' },
        { id: 'rdl', name: 'RDLs', target: '4 × 10', sets: 4, measure: 'weight' },
        { id: 'bss', name: 'Bulgarian Split Squats', target: '3 × 10', sets: 3, measure: 'weight' },
        { id: 'ham-curl', name: 'Lying Hamstring Curls', target: '3 × 12', sets: 3, measure: 'weight' },
        { id: 'glute-kickback', name: 'Glute Kickback (optional)', target: '2 × 12', sets: 2, measure: 'weight' },
      ],
    },
    {
      id: 'upper-2',
      name: 'Upper Body 2',
      subtitle: 'Back & biceps',
      exercises: [
        { id: 'assisted-pull-ups', name: 'Assisted Pull-Ups', target: '3 × max reps', sets: 3, measure: 'weight' },
        { id: 'row', name: 'Barbell Row or Cable Row', target: '3 × 8-10', sets: 3, measure: 'weight' },
        { id: 'lat-pulldown', name: 'Lat Pulldown (Neutral/Wide Grip)', target: '3 × 10-12', sets: 3, measure: 'weight' },
        { id: 'single-arm-row', name: 'Single Arm DB Row', target: '2–3 × 10', sets: 3, measure: 'weight' },
        { id: 'bicep-curl', name: 'DB Bicep Curls', target: '3 × 10-12', sets: 3, measure: 'weight' },
      ],
    },
    {
      id: 'lower-2',
      name: 'Lower Body 2',
      subtitle: 'Glute & anterior chain',
      exercises: [
        { id: 'bb-squat', name: 'BB Squats', target: '3 × 6-8', sets: 3, measure: 'weight' },
        { id: 'hip-thrust-machine', name: 'Hip Thrust Machine', target: '3 × 10', sets: 3, measure: 'weight' },
        { id: 'step-ups', name: 'Step-Ups', target: '3 × 8-10', sets: 3, measure: 'weight' },
        { id: 'leg-ext', name: 'Leg Extensions', target: '3 × 12', sets: 3, measure: 'weight' },
        { id: 'hip-abduction', name: 'Hip Abductions', target: '2 × 15', sets: 2, measure: 'weight' },
      ],
    },
  ],
};
