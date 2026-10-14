import type { AppData } from '../types';
import { DEFAULT_PROGRAM_ID } from '../data/programs';
import { buildImportedSessions } from './importHistory';

// All logged data is kept as one JSON document in localStorage. This module is
// the only place that touches storage, so swapping to a cloud backend later
// means re-implementing loadData/saveData and nothing else.

const STORAGE_KEY = 'gym-app:data';
const CORRUPT_KEY = 'gym-app:corrupt-backup';
export const CURRENT_VERSION = 1;

export function createInitialData(): AppData {
  return {
    version: CURRENT_VERSION,
    sessions: buildImportedSessions(),
    settings: { activeProgramId: DEFAULT_PROGRAM_ID, programStartDates: {} },
  };
}

/**
 * Upgrade older saved data to the current shape. When the stored format changes,
 * bump CURRENT_VERSION and add a step here, e.g.
 *   if (data.version === 1) { ...transform...; data.version = 2; }
 */
export function migrate(raw: unknown): AppData {
  if (!isAppData(raw)) throw new Error('Not a gym app data file');
  const data = structuredClone(raw);
  if (data.version > CURRENT_VERSION) {
    throw new Error('This data was saved by a newer version of the app. Refresh to update.');
  }
  data.settings.programStartDates ??= {};
  data.settings.activeProgramId ??= DEFAULT_PROGRAM_ID;
  data.version = CURRENT_VERSION;
  return data;
}

export function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<AppData>;
  return typeof v.version === 'number' && Array.isArray(v.sessions) && !!v.settings && typeof v.settings === 'object';
}

export function loadData(): AppData {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return createInitialData();
  }
  if (!raw) return createInitialData();
  try {
    return migrate(JSON.parse(raw));
  } catch (err) {
    // Never silently throw away logged data: stash the unreadable copy first.
    console.error('Could not read saved data', err);
    try {
      localStorage.setItem(CORRUPT_KEY, raw);
    } catch {
      /* ignore */
    }
    return createInitialData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Could not save data', err);
    alert('Could not save your data on this device. Try exporting a backup from Settings.');
  }
}

/** Ask the browser not to evict our storage under pressure (best effort). */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
    /* not supported */
  }
}
