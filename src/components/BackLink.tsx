import { ChevronLeft } from './Icons';

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <a className="back" href={`#${to}`}>
      <ChevronLeft />
      {label}
    </a>
  );
}
