import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MapPinned, Route, GitCompareArrows, ChartNoAxesCombined, MapPin,
  ThermometerSun, Clock3, Map, Trees, SunMedium, Building2,
  CalendarClock, CalendarRange,
  ShieldCheck, HardHat, Refrigerator, Utensils,
  Siren, CloudSun, TriangleAlert,
  ChevronRight, ChevronsLeft, ChevronsRight, Flame
} from 'lucide-react';

const NAV_GROUPS = [
  {
    id: 'find-location',
    label: 'Find a Location',
    Icon: MapPinned,
    items: [
      { label: 'Location Planner', Icon: Route, path: '/location-planner' },
      { label: 'Location Comparison', Icon: GitCompareArrows, path: '/location-comparison' },
      { label: 'Business Potential', Icon: ChartNoAxesCombined, path: '/business-potential' },
      { label: 'Nearby Activity', Icon: MapPin, path: '/nearby-activity' },
    ],
  },
  {
    id: 'heat-conditions',
    label: 'Heat Conditions',
    Icon: ThermometerSun,
    items: [
      { label: '12-Hour Heat Outlook', Icon: Clock3, path: '/heat-outlook' },
      { label: 'Local Heat Map', Icon: Map, path: '/local-heat-map' },
      { label: 'Shade Finder', Icon: Trees, path: '/shade-finder' },
      { label: 'Solar Exposure Map', Icon: SunMedium, path: '/solar-exposure' },
      { label: 'Urban Heat Insights', Icon: Building2, path: '/urban-heat' },
    ],
  },
  {
    id: 'plan-operations',
    label: 'Plan Operations',
    Icon: CalendarClock,
    items: [
      { label: 'Operating Window Planner', Icon: CalendarRange, path: '/operating-window' },
    ],
  },
  {
    id: 'safety',
    label: 'Safety',
    Icon: ShieldCheck,
    items: [
      { label: 'Crew Heat Safety', Icon: HardHat, path: '/crew-safety' },
      { label: 'Cold Storage Protection', Icon: Refrigerator, path: '/cold-storage' },
      { label: 'Food Safety Guard', Icon: Utensils, path: '/food-safety' },
    ],
  },
  {
    id: 'alerts-risks',
    label: 'Alerts & Risks',
    Icon: Siren,
    items: [
      { label: 'Environmental Risk Center', Icon: CloudSun, path: '/environmental-risk' },
      { label: 'Critical Condition Alerts', Icon: TriangleAlert, path: '/critical-alerts' },
    ],
  },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();

  const activeGroup = NAV_GROUPS.find(g =>
    g.items.some(i => location.pathname === i.path)
  );

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    NAV_GROUPS.forEach(g => { initial[g.id] = true; });
    return initial;
  });

  const toggleGroup = (id) => {
    if (collapsed) { setCollapsed(false); return; }
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Flame size={18} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <span className="logo-title">THERMOSARVA</span>
          <span className="logo-subtitle">Food Truck Intelligence</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_GROUPS.map((group, gi) => {
          const isActive = activeGroup?.id === group.id;
          const isOpen = openGroups[group.id];
          return (
            <div key={group.id} className={`sidebar-group${isActive ? ' active-group' : ''}`}>
              {gi > 0 && <div className="sidebar-divider" />}
              <div
                className={`sidebar-group-header${isActive ? ' active' : ''}`}
                onClick={() => toggleGroup(group.id)}
              >
                <div className="group-icon">
                  <group.Icon size={16} />
                </div>
                <span className="group-label">{group.label}</span>
                <ChevronRight
                  size={12}
                  className={`group-chevron${isOpen ? ' open' : ''}`}
                />
              </div>

              <div className={`sidebar-group-items${isOpen ? ' open' : ''}`}>
                {group.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-nav-item${isActive ? ' active' : ''}`
                    }
                  >
                    <span className="nav-icon"><item.Icon size={14} /></span>
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="sidebar-collapse-btn">
        <button
          className="collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>
    </aside>
  );
}
