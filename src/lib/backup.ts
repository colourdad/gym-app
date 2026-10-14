import type { AppData } from '../types';
import { migrate } from './storage';
import { toLocalDateString } from './dates';

/**
 * Hand the user a JSON backup file. On iPhone this opens the share sheet
 * (save to Files, AirDrop, email...); elsewhere it downloads the file.
 */
export async function exportBackup(data: AppData): Promise<boolean> {
  const name = `gym-backup-${toLocalDateString(new Date())}.json`;
  const json = JSON.stringify(data, null, 2);
  const file = new File([json], name, { type: 'application/json' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Gym backup' });
      return true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false;
      // fall through to a plain download
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export async function readBackup(file: File): Promise<AppData> {
  const text = await file.text();
  return migrate(JSON.parse(text));
}
