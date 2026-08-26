import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TriangleAlert, Thermometer, MapPin, Search, Loader2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const BREADCRUMBS = {
  '/dashboard/location-planner':    ['Find a Location', 'Location Planner'],
  '/dashboard/location-comparison': ['Find a Location', 'Location Comparison'],
  '/dashboard/business-potential':  ['Find a Location', 'Business Potential Insights'],
  '/dashboard/nearby-activity':     ['Find a Location', 'Nearby Activity Explorer'],
  '/dashboard/heat-outlook':        ['Heat Conditions', '12-Hour Heat Outlook'],
  '/dashboard/local-heat-map':      ['Heat Conditions', 'Local Heat Map'],
  '/dashboard/shade-finder':        ['Heat Conditions', 'Shade Finder'],
  '/dashboard/solar-exposure':      ['Heat Conditions', 'Solar Exposure Map'],
  '/dashboard/air-quality':         ['Heat Conditions', 'Air Quality View'],
  '/dashboard/urban-heat':          ['Heat Conditions', 'Urban Heat Insights'],
  '/dashboard/operating-window':    ['Plan Operations', 'Operating Window Planner'],
  '/dashboard/menu-timing':         ['Plan Operations', 'Menu Timing Planner'],
  '/dashboard/event-opportunity':   ['Business Planning', 'Event Opportunity Planner'],
  '/dashboard/location-performance':['Business Planning', 'Location Performance Insights'],
  '/dashboard/site-planning':       ['Business Planning', 'Site Planning'],
  '/dashboard/crew-safety':         ['Safety', 'Crew Heat Safety'],
  '/dashboard/cold-storage':        ['Safety', 'Cold Storage Protection'],
  '/dashboard/food-safety':         ['Safety', 'Food Safety Guard'],
  '/dashboard/environmental-risk':  ['Alerts & Risks', 'Environmental Risk Center'],
  '/dashboard/critical-alerts':     ['Alerts & Risks', 'Critical Condition Alerts'],
};

export default function TopBar({ alertCount = 0 }) {
  const routerLocation = useLocation();
  const crumbs = BREADCRUMBS[routerLocation.pathname] || ['Thermosarva'];

  const { location, dashboardData, loading, searchAndNavigate } = useApp();

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
    else setQuery('');
  }, [searchOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    await searchAndNavigate(query.trim());
    setSearchOpen(false);
  };

  // Pull live heat index from dashboard data
  const heatIndex = dashboardData?.thermal?.current?.heat_index_c
    ?? dashboardData?.thermal?.current?.heat_index
    ?? null;

  const locationLabel = location?.city
    ? `${location.city}${location.state ? ', ' + location.state : ''}`
    : null;

  return (
    <>
      <div className="top-bar">
        {/* Breadcrumb */}
        <div className="top-bar-breadcrumb">
          <span>Thermosarva</span>
          {crumbs.map((crumb, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="breadcrumb-sep">›</span>
              <span className={i === crumbs.length - 1 ? 'breadcrumb-current' : ''}>{crumb}</span>
            </span>
          ))}
        </div>

        <div className="top-bar-status">
          {/* Location search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search US city or address…"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  outline: 'none',
                  width: 220,
                }}
              />
              <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {loading ? <Loader2 size={14} className="spin" /> : <Search size={14} />}
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={14} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="status-pill"
              style={{ cursor: 'pointer', gap: 6 }}
              title="Search for a US location"
            >
              <MapPin size={11} />
              {loading ? 'Loading…' : (locationLabel || 'Select Location')}
              <Search size={10} style={{ opacity: 0.6 }} />
            </button>
          )}

          {/* Live heat index */}
          {heatIndex != null && (
            <div className="status-pill warning">
              <Thermometer size={11} />
              {Math.round(heatIndex)}°C Heat Index
            </div>
          )}

          {/* Active alerts */}
          {alertCount > 0 && (
            <div className="status-pill critical">
              <span className="pulse-dot" />
              {alertCount} Critical
            </div>
          )}
        </div>
      </div>

      {/* Alert banner if critical alerts exist */}
      {alertCount > 0 && (
        <div className="alert-banner">
          <TriangleAlert size={14} className="alert-banner-icon" />
          <span className="alert-banner-text">
            <strong>Active critical conditions.</strong> Extreme heat warning detected for {locationLabel || 'this location'}.
          </span>
          <span className="alert-banner-count">{alertCount} require action</span>
        </div>
      )}
    </>
  );
}
