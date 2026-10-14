import type { Session } from '../types';
import { useNow } from '../lib/useNow';
import { formatClock } from '../lib/dates';
import { sessionDurationMs } from '../lib/stats';

export function LiveBanner({ session }: { session: Session }) {
  const now = useNow();
  return (
    <a className="live-banner" href={`#/session/${session.id}`}>
      <span className="row">
        <span className="live-dot" />
        <strong>{session.workoutName}</strong>
      </span>
      <span className="row" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
        {formatClock(sessionDurationMs(session, now))}
      </span>
    </a>
  );
}
