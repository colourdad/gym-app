import { useEffect, useState } from 'react';

// Hash-based routing (#/plan, #/session/abc) so the app works as plain static
// files on any host, including GitHub Pages, with no server config.

export function currentPath(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

export function navigate(path: string, opts: { replace?: boolean } = {}): void {
  if (opts.replace) {
    window.history.replaceState(null, '', `#${path}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = path;
  }
}

export function useRoute(): string[] {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path.split('/').filter(Boolean).map(decodeURIComponent);
}
