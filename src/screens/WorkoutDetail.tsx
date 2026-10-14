import { useAppData } from '../lib/store';
import { activeSession, logPastSession, startSession } from '../lib/actions';
import { findWorkout } from '../lib/program';
import { getProgram } from '../data/programs';
import { lastPerformance, summarizeLog } from '../lib/stats';
import { navigate } from '../lib/router';
import { BackLink } from '../components/BackLink';
import { ChevronRight, PlayIcon } from '../components/Icons';

export function WorkoutDetail({ programId, workoutId }: { programId: string; workoutId: string }) {
  const data = useAppData();
  const program = getProgram(programId);
  const workout = findWorkout(programId, workoutId);
  const live = activeSession();

  if (!program || !workout) {
    return <div className="empty">Workout not found. <a href="#/plan">Back to plan</a></div>;
  }

  return (
    <div className="stack">
      <BackLink to="/plan" label="Plan" />
      <div>
        <div className="muted">{program.name}</div>
        <h1>{workout.name}</h1>
        {workout.subtitle && <p className="sub">{workout.subtitle}</p>}
      </div>

      {live ? (
        <a className="btn block" href={`#/session/${live.id}`}>
          Continue {live.workoutName} (in progress)
        </a>
      ) : (
        <button type="button" className="btn block" onClick={() => navigate(`/session/${startSession(programId, workoutId)}`)}>
          <PlayIcon /> Start {workout.name}
        </button>
      )}
      <button
        type="button"
        className="btn secondary block"
        onClick={() => navigate(`/session/${logPastSession(programId, workoutId)}`)}
      >
        Log a session I forgot to track
      </button>

      {workout.exercises.length > 0 && (
        <div className="card" style={{ paddingTop: 4, paddingBottom: 4 }}>
          {workout.exercises.map((ex) => {
            const last = lastPerformance(data.sessions, ex.id);
            return (
              <a key={ex.id} className="list-item" href={`#/exercise/${encodeURIComponent(ex.id)}`}>
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>{ex.name}</div>
                  <div className="small" style={{ color: 'var(--accent)', fontWeight: 600 }}>{ex.target}</div>
                  {ex.tip && <div className="tip">{ex.tip}</div>}
                  {last && <div className="muted small">Last: {summarizeLog(last)}</div>}
                </div>
                <ChevronRight />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
