import type { ReactNode } from 'react';
import { HistoryIcon, HomeIcon, PlanIcon, SettingsIcon, StatsIcon } from './Icons';

// To add a new tab: add an entry here and a matching route in App.tsx.
const TABS: { path: string; match: string[]; label: string; icon: ReactNode }[] = [
  { path: '/', match: ['', 'session'], label: 'Today', icon: <HomeIcon /> },
  { path: '/plan', match: ['plan'], label: 'Plan', icon: <PlanIcon /> },
  { path: '/history', match: ['history', 'exercise'], label: 'History', icon: <HistoryIcon /> },
  { path: '/stats', match: ['stats'], label: 'Stats', icon: <StatsIcon /> },
  { path: '/settings', match: ['settings'], label: 'Settings', icon: <SettingsIcon /> },
];

export function TabBar({ section }: { section: string }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <a key={t.path} href={`#${t.path}`} className={t.match.includes(section) ? 'active' : ''}>
          {t.icon}
          {t.label}
        </a>
      ))}
    </nav>
  );
}
