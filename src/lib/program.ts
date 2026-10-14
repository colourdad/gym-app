import type { AppData, Program, WorkoutTemplate } from '../types';
import { getProgram, programs } from '../data/programs';
import { daysBetween, parseLocalDate } from './dates';

export function activeProgram(data: AppData): Program {
  return getProgram(data.settings.activeProgramId) ?? programs[0];
}

export function programStartDate(data: AppData, program: Program): string {
  return data.settings.programStartDates[program.id] ?? program.startDate;
}

/** 1-based week of the program for a given date, clamped to [1, program.weeks]. */
export function programWeek(data: AppData, program: Program, at: Date = new Date()): number {
  const start = parseLocalDate(programStartDate(data, program));
  const week = Math.floor(daysBetween(start, at) / 7) + 1;
  return Math.min(Math.max(week, 1), program.weeks);
}

export function findWorkout(programId: string, workoutId: string): WorkoutTemplate | undefined {
  return getProgram(programId)?.workouts.find((w) => w.id === workoutId);
}

export function plannedForDay(program: Program, date: Date = new Date()) {
  return program.schedule.find((s) => s.day === date.getDay());
}
