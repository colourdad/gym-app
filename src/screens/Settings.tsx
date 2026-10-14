import { useRef, useState } from 'react';
import { getData, replaceData, useAppData } from '../lib/store';
import { updateSettings } from '../lib/actions';
import { exportBackup, readBackup } from '../lib/backup';
import { activeProgram, programStartDate } from '../lib/program';
import { programs } from '../data/programs';
import { daysBetween, formatDate } from '../lib/dates';

export function Settings() {
  const data = useAppData();
  const program = activeProgram(data);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const lastBackup = data.settings.lastBackupAt;
  const backupAge = lastBackup ? daysBetween(new Date(lastBackup), new Date()) : null;

  const onExport = async () => {
    if (await exportBackup(getData())) {
      updateSettings({ lastBackupAt: new Date().toISOString() });
      setMessage('Backup created.');
    }
  };

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const imported = await readBackup(file);
      const n = imported.sessions.length;
      if (!confirm(`Replace everything on this phone with the backup (${n} sessions)?`)) return;
      replaceData(imported);
      setMessage(`Restored ${n} sessions.`);
    } catch (err) {
      alert(`That file couldn’t be restored: ${(err as Error).message}`);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="stack">
      <h1>Settings</h1>

      <h2>Program</h2>
      <div className="card stack">
        <label className="field">
          <span>Current program</span>
          <select value={program.id} onChange={(e) => updateSettings({ activeProgramId: e.target.value })}>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Week 1 started on</span>
          <input
            type="date"
            value={programStartDate(data, program)}
            onChange={(e) =>
              e.target.value &&
              updateSettings({ programStartDates: { ...data.settings.programStartDates, [program.id]: e.target.value } })
            }
          />
        </label>
        <p className="muted small">Used to work out which week of the program you’re in.</p>
      </div>

      <h2>Backup</h2>
      <div className="card stack">
        <p className="sub">
          Your workouts are saved on this phone. Export a backup now and then (to Files, iCloud Drive, or email it to
          yourself) so nothing is lost if you change phones or delete the app.
        </p>
        <p className="small" style={{ color: backupAge === null || backupAge > 14 ? 'var(--danger)' : 'var(--good)' }}>
          {lastBackup ? `Last backup: ${formatDate(lastBackup)} (${backupAge === 0 ? 'today' : `${backupAge} days ago`})` : 'No backup yet'}
        </p>
        <button type="button" className="btn block" onClick={onExport}>Export backup</button>
        <button type="button" className="btn secondary block" onClick={() => fileRef.current?.click()}>
          Restore from backup
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => onImport(e.target.files?.[0])}
        />
        {message && <p className="small" style={{ color: 'var(--good)' }}>{message}</p>}
      </div>

      <h2>Add to Home Screen</h2>
      <div className="card">
        <p className="sub">
          In Safari, tap the Share button, then <strong>Add to Home Screen</strong>. The app then opens full screen
          like a normal app and works without signal at the gym.
        </p>
      </div>

      <p className="muted small center">{data.sessions.length} sessions stored · data version {data.version}</p>
    </div>
  );
}
