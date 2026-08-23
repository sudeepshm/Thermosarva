import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MapPinned, Route, GitCompareArrows, ChartNoAxesCombined, MapPin,
  ThermometerSun, Clock3, Map, Trees, SunMedium, Building2, Wind,
  CalendarClock, CalendarRange, UtensilsCrossed,
  BriefcaseBusiness, CalendarDays, ChartSpline, Warehouse,
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
      { label: 'Location Planner',             Icon: Route,               path: '/dashboard/location-planner' },
      { label: 'Location Comparison',          Icon: GitCompareArrows,    path: '/dashboard/location-comparison' },
      { label: 'Nearby Activity Explorer',     Icon: MapPin,              path: '/dashboard/nearby-activity' },
      { label: 'Business Potential Insights',  Icon: ChartNoAxesCombined, path: '/dashboard/business-potential' },
      { label: 'Shade Finder',                 Icon: Trees,               path: '/dashboard/shade-finder' },
    ],
  },
  {
    id: 'heat-conditions',
    label: 'Heat Conditions',
    Icon: ThermometerSun,
    items: [
      { label: '12-Hour Heat Outlook', Icon: Clock3,    path: '/dashboard/heat-outlook' },
      { label: 'Local Heat Map',       Icon: Map,       path: '/dashboard/local-heat-map' },
      { label: 'Shade Finder',         Icon: Trees,     path: '/dashboard/shade-finder' },
      { label: 'Solar Exposure Map',   Icon: SunMedium, path: '/dashboard/solar-exposure' },
      { label: 'Air Quality View',     Icon: Wind,      path: '/dashboard/air-quality' },
      { label: 'Urban Heat Insights',  Icon: Building2, path: '/dashboard/urban-heat' },
    ],
  },
  {
    id: 'plan-operations',
    label: 'Plan Operations',
    Icon: CalendarClock,
    items: [
      { label: 'Operating Window Planner', Icon: CalendarRange,   path: '/dashboard/operating-window' },
      { label: 'Menu Timing Planner',      Icon: UtensilsCrossed, path: '/dashboard/menu-timing' },
    ],
  },
  {
    id: 'business-planning',
    label: 'Business Planning',
    Icon: BriefcaseBusiness,
    items: [
      { label: 'Event Opportunity Planner',     Icon: CalendarDays, path: '/dashboard/event-opportunity' },
      { label: 'Location Performance Insights', Icon: ChartSpline,  path: '/dashboard/location-performance' },
      { label: 'Site Planning',                 Icon: Warehouse,    path: '/dashboard/site-planning' },
    ],
  },
  {
    id: 'safety',
    label: 'Safety',
    Icon: ShieldCheck,
    items: [
      { label: 'Crew Heat Safety',        Icon: HardHat,      path: '/dashboard/crew-safety' },
      { label: 'Cold Storage Protection', Icon: Refrigerator, path: '/dashboard/cold-storage' },
      { label: 'Food Safety Guard',       Icon: Utensils,     path: '/dashboard/food-safety' },
    ],
  },
  {
    id: 'alerts-risks',
    label: 'Alerts & Risks',
    Icon: Siren,
    items: [
      { label: 'Environmental Risk Center',  Icon: CloudSun,      path: '/dashboard/environmental-risk' },
      { label: 'Critical Condition Alerts',  Icon: TriangleAlert, path: '/dashboard/critical-alerts' },
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
