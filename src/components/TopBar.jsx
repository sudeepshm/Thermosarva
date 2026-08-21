import { useLocation } from 'react-router-dom';
import { TriangleAlert, Thermometer } from 'lucide-react';

const BREADCRUMBS = {
  '/location-planner':   ['Find a Location', 'Location Planner'],
  '/location-comparison':['Find a Location', 'Location Comparison'],
  '/business-potential': ['Find a Location', 'Business Potential Insights'],
  '/nearby-activity':    ['Find a Location', 'Nearby Activity Explorer'],
  '/heat-outlook':       ['Heat Conditions', '12-Hour Heat Outlook'],
  '/local-heat-map':     ['Heat Conditions', 'Local Heat Map'],
  '/shade-finder':       ['Heat Conditions', 'Shade Finder'],
  '/solar-exposure':     ['Heat Conditions', 'Solar Exposure Map'],
  '/urban-heat':         ['Heat Conditions', 'Urban Heat Insights'],
  '/operating-window':   ['Plan Operations', 'Operating Window Planner'],
  '/crew-safety':        ['Safety', 'Crew Heat Safety'],
  '/cold-storage':       ['Safety', 'Cold Storage Protection'],
  '/food-safety':        ['Safety', 'Food Safety Guard'],
  '/environmental-risk': ['Alerts & Risks', 'Environmental Risk Center'],
  '/critical-alerts':    ['Alerts & Risks', 'Critical Condition Alerts'],
};

export default function TopBar({ alertCount = 2 }) {
  const location = useLocation();
  const crumbs = BREADCRUMBS[location.pathname] || ['Thermosarva'];

  return (
    <>
      <div className="top-bar">
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
          {/* Live heat index */}
          <div className="status-pill warning">
            <Thermometer size={11} />
            41°C Heat Index
          </div>

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
            <strong>Active critical conditions.</strong> Extreme heat warning and cold storage risk detected.
          </span>
          <span className="alert-banner-count">{alertCount} require action</span>
        </div>
      )}
    </>
  );
}
