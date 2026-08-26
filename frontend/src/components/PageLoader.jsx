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

export function PageError({ message, onRetry }) {
  return (
    <div className="page-loading" style={{ gap: 12 }}>
      <WifiOff size={32} style={{ color: 'var(--status-critical)' }} />
      <span style={{ color: 'var(--status-critical)' }}>{message || 'Failed to load data'}</span>
      {onRetry && (
        <button
          className="btn-primary"
          style={{
            marginTop: 8,
            padding: '8px 18px',
            fontSize: '0.85rem',
            background: 'var(--brand-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          onClick={onRetry}
        >
          Retry Connection
        </button>
      )}
    </div>
  );
}

/**
 * Wraps content with a loading/error guard.
 * Shows skeleton during first load, renders children when data is ready.
 */
export function DataGuard({ loading, error, data, children, message, onRetry }) {
  if (loading && !data) return <PageLoader message={message} />;
  if (error && !data)   return <PageError message={error} onRetry={onRetry} />;
  if (!data) return <PageError message="Search for a U.S. city or address to load FortyGuard data." />;
  return children;
}
