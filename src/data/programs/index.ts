import type { Program } from '../../types';
import { october2026 } from './october-2026';
import { march2026 } from './march-2026';

// To add a new program block: copy october-2026.ts, edit it, import it here,
// and put it first in the list. Choose it in Settings (or change DEFAULT_PROGRAM_ID).
export const programs: Program[] = [october2026, march2026];

export const DEFAULT_PROGRAM_ID = october2026.id;

export function getProgram(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}
