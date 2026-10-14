import { useSyncExternalStore } from 'react';
import type { AppData } from '../types';
import { loadData, saveData } from './storage';

// A tiny global store. Components read with useAppData() and change data via
// the functions in actions.ts, which all go through updateData(). Every change
// is saved to the device immediately.

let state: AppData = loadData();
const listeners = new Set<() => void>();

export function getData(): AppData {
  return state;
}

export function updateData(fn: (draft: AppData) => AppData | void): void {
  const draft = structuredClone(state);
  state = fn(draft) ?? draft;
  saveData(state);
  listeners.forEach((l) => l());
}

export function replaceData(next: AppData): void {
  updateData(() => next);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, getData);
}
