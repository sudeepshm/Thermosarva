/**
 * src/components/PageLoader.jsx
 * Shared loading and error states for all dashboard pages.
 */

import { Loader2, WifiOff } from 'lucide-react';

export function PageLoader({ message = 'Fetching live data…' }) {
  return (
    <div className="page-loading">
      <Loader2 size={32} className="spin" />
      <span>{message}</span>
    </div>
  );
}

export function PageError({ message }) {
  return (
    <div className="page-loading">
      <WifiOff size={32} style={{ color: 'var(--status-critical)' }} />
      <span style={{ color: 'var(--status-critical)' }}>{message || 'Failed to load data'}</span>
    </div>
  );
}

/**
 * Wraps content with a loading/error guard.
 * Shows skeleton during first load, renders children when data is ready.
 */
export function DataGuard({ loading, error, data, children, message }) {
  if (loading && !data) return <PageLoader message={message} />;
  if (error && !data)   return <PageError message={error} />;
  return children;
}
