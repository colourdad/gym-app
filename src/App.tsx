import { useRoute } from './lib/router';
import { useAppData } from './lib/store';
import { TabBar } from './components/TabBar';
import { LiveBanner } from './components/LiveBanner';
import { Today } from './screens/Today';
import { Plan } from './screens/Plan';
import { WorkoutDetail } from './screens/WorkoutDetail';
import { SessionScreen } from './screens/SessionScreen';
import { History } from './screens/History';
import { ExerciseHistory } from './screens/ExerciseHistory';
import { Stats } from './screens/Stats';
import { Settings } from './screens/Settings';

// Routes. To add a screen: create it in src/screens, add a case here, and
// (if it needs a tab) add it to TABS in components/TabBar.tsx.
function Screen({ parts }: { parts: string[] }) {
  const [section, a, b] = parts;
  switch (section) {
    case undefined:
      return <Today />;
    case 'plan':
      return a && b ? <WorkoutDetail programId={a} workoutId={b} /> : <Plan />;
    case 'session':
      return <SessionScreen id={a} />;
    case 'history':
      return <History />;
    case 'exercise':
      return <ExerciseHistory exerciseId={a} />;
    case 'stats':
      return <Stats />;
    case 'settings':
      return <Settings />;
    default:
      return <Today />;
  }
}

export function App() {
  const parts = useRoute();
  const data = useAppData();
  const live = data.sessions.find((s) => s.endedAt === null);
  const onLiveSession = parts[0] === 'session' && parts[1] === live?.id;

  return (
    <>
      <main className="app">
        <Screen key={parts.join('/')} parts={parts} />
      </main>
      {live && !onLiveSession && <LiveBanner session={live} />}
      <TabBar section={parts[0] ?? ''} />
    </>
  );
}
