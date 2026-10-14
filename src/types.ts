// Core data model. Two kinds of data live in the app:
//
//  1. Programs (the plan). These are defined in code under src/data/programs
//     and shipped with the app, so updating a program is a code change.
//  2. Logged data (sessions, settings). This is created on the phone and saved
//     in local storage via src/lib/storage.ts.
//
// Logged sessions reference programs by id but also keep a snapshot of names,
// so history still reads correctly after a program is edited or retired.

/** How an exercise is measured, which controls the inputs shown per set. */
export type Measure =
  | 'weight' // reps + kg
  | 'reps' // reps only (bodyweight)
  | 'time' // seconds held (dead hangs, planks)
  | 'check'; // just tick it off (mobility drills)

export interface ExerciseTemplate {
  id: string;
  name: string;
  /** Prescription shown to the user, e.g. "3 × 8-10". */
  target: string;
  /** Default number of set rows to show when logging. */
  sets: number;
  measure: Measure;
  tip?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  subtitle?: string;
  /** Activities (bouldering, hikes...) have no exercises, just a timer + notes. */
  exercises: ExerciseTemplate[];
  optional?: boolean;
}

export interface ScheduleDay {
  /** 0 = Sunday ... 6 = Saturday, matching Date.getDay(). */
  day: number;
  /** Workout ids planned for this day; several means "either/or". Empty = rest. */
  workoutIds: string[];
  label: string;
}

export interface Program {
  id: string;
  name: string;
  /** ISO date (yyyy-mm-dd) the program starts; used to work out the current week. */
  startDate: string;
  weeks: number;
  restNote?: string;
  schedule: ScheduleDay[];
  workouts: WorkoutTemplate[];
}

export interface SetLog {
  reps?: number;
  weight?: number;
  seconds?: number;
  done: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  measure: Measure;
  sets: SetLog[];
  notes: string;
  /**
   * Free-text values for data imported from the old spreadsheet, which
   * recorded things like "4 x 8-10" and "7.5kgs x 2" rather than per-set numbers.
   */
  legacy?: { reps: string; weight: string };
}

export interface Session {
  id: string;
  programId: string;
  workoutId: string;
  workoutName: string;
  /** Program week (1-based) this session counts towards. */
  week: number;
  /** ISO timestamps. endedAt is null while the session is running. */
  startedAt: string;
  endedAt: string | null;
  exercises: ExerciseLog[];
  notes: string;
  /** Sessions imported from the spreadsheet have no real times and don't count toward hours. */
  imported?: boolean;
}

export interface Settings {
  activeProgramId: string;
  /** Per-program overrides of the start date, keyed by program id. */
  programStartDates: Record<string, string>;
  /** ISO timestamp of the last time a backup file was exported. */
  lastBackupAt?: string;
}

export interface AppData {
  /** Schema version, bumped whenever the stored shape changes (see storage.ts migrations). */
  version: number;
  sessions: Session[];
  settings: Settings;
}
