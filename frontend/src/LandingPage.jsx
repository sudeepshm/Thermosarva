import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapContainer, TileLayer, Circle, Marker, Popup, useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  MapPinned, Route, GitCompareArrows, ChartNoAxesCombined, MapPin,
  ThermometerSun, Clock3, Map as MapIcon, Trees, SunMedium, Building2,
  CalendarClock, CalendarRange,
  ShieldCheck, HardHat, Refrigerator, Utensils,
  Siren, CloudSun, TriangleAlert,
  ArrowRight, ChevronDown
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Leaflet default icon path fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Thermal Color Palette ──────────────────────────────────────────────────

const COLOR_STOPS = [
  [0.00, [12, 50,  175]],   // 10°C  deep blue
  [0.22, [18, 148, 215]],   // 17°C  blue-teal
  [0.43, [42, 195, 160]],   // 24°C  teal/green
  [0.62, [228, 168, 32]],   // 30°C  amber-gold
  [0.78, [240, 96,  18]],   // 35°C  orange
  [1.00, [215, 28,  12]],   // 42°C  controlled red
];

function tempToRGB(temp) {
  const t = Math.max(0, Math.min(1, (temp - 10) / 32));
  let lo = COLOR_STOPS[0], hi = COLOR_STOPS[COLOR_STOPS.length - 1];
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (t >= COLOR_STOPS[i][0] && t <= COLOR_STOPS[i + 1][0]) {
      lo = COLOR_STOPS[i]; hi = COLOR_STOPS[i + 1]; break;
    }
  }
  const f = lo[0] === hi[0] ? 0 : (t - lo[0]) / (hi[0] - lo[0]);
  return lo[1].map((c, i) => Math.round(c + (hi[1][i] - c) * f));
}

function tempToCSS(temp) {
  const [r, g, b] = tempToRGB(temp);
  return `rgb(${r},${g},${b})`;
}

// ── 13 Real Geographic US Cities Data ──────────────────────────────────────

const CITIES = [
  { name: 'Seattle',       state: 'WA', temp: 18, lat: 47.6062, lon: -122.3321, status: 'Optimal Mild',       aqi: 42,  condition: 'Temperate canopy, low heat distress' },
  { name: 'San Francisco', state: 'CA', temp: 22, lat: 37.7749, lon: -122.4194, status: 'Marine Microclimate',aqi: 38,  condition: 'Cool coastal breeze offset' },
  { name: 'Los Angeles',   state: 'CA', temp: 31, lat: 34.0522, lon: -118.2437, status: 'Elevated Heat',      aqi: 85,  condition: 'High solar exposure, low shade index' },
  { name: 'Phoenix',       state: 'AZ', temp: 39, lat: 33.4484, lon: -112.0740, status: 'Extreme Stress',     aqi: 142, condition: 'Critical thermal load, zero canopy relief' },
  { name: 'Denver',        state: 'CO', temp: 23, lat: 39.7392, lon: -104.9903, status: 'Moderate UV',       aqi: 45,  condition: 'High elevation, intense radiation' },
  { name: 'Dallas',        state: 'TX', temp: 37, lat: 32.7767, lon: -96.7970,  status: 'Severe Thermal',    aqi: 115, condition: 'High surface heat accumulation' },
  { name: 'Houston',       state: 'TX', temp: 35, lat: 29.7604, lon: -95.3698,  status: 'High Humidity',     aqi: 105, condition: 'Dense vapor heat retention' },
  { name: 'Chicago',       state: 'IL', temp: 26, lat: 41.8781, lon: -87.6298,  status: 'Moderate Heat',     aqi: 68,  condition: 'Urban heat island effect active' },
  { name: 'Minneapolis',   state: 'MN', temp: 21, lat: 44.9778, lon: -93.2650,  status: 'Mild Exposure',     aqi: 40,  condition: 'Balanced thermal index' },
  { name: 'Atlanta',       state: 'GA', temp: 31, lat: 33.7490, lon: -84.3880,  status: 'Elevated Thermal',  aqi: 82,  condition: 'High humidity & canopy microclimate' },
  { name: 'Miami',         state: 'FL', temp: 33, lat: 25.7617, lon: -80.1918,  status: 'Tropical Stress',   aqi: 65,  condition: 'Sustained solar radiation' },
  { name: 'New York',      state: 'NY', temp: 28, lat: 40.7128, lon: -74.0060,  status: 'Urban Heat',        aqi: 72,  condition: 'Concrete heat retention active' },
  { name: 'Boston',        state: 'MA', temp: 24, lat: 42.3601, lon: -71.0589,  status: 'Stable Conditions', aqi: 40,  condition: 'Coastal buffer zone' },
];

// ── Real Geographic Thermal Regions ───────────────────────────────────────

const REAL_THERMAL_REGIONS = [
  { id: 'southwest-desert', lat: 33.4484, lon: -112.0740, radius: 420000, temp: 39 },
  { id: 'texas-belt',       lat: 31.2000, lon: -96.5000,  radius: 400000, temp: 37 },
  { id: 'gulf-florida',     lat: 28.5000, lon: -82.5000,  radius: 380000, temp: 33 },
  { id: 'midwest-corridor', lat: 42.5000, lon: -89.0000,  radius: 350000, temp: 26 },
  { id: 'northeast-urban',  lat: 41.2000, lon: -73.5000,  radius: 300000, temp: 28 },
  { id: 'rockies-plains',   lat: 39.7000, lon: -105.0000, radius: 340000, temp: 23 },
  { id: 'pacific-nw',       lat: 46.5000, lon: -122.5000, radius: 320000, temp: 18 },
];

// ── Leaflet DivIcon Factory ───────────────────────────────────────────────

function createCityDivIcon(city) {
  const color = tempToCSS(city.temp);
  return L.divIcon({
    className: 'leaflet-city-div-icon',
    html: `
      <div class="city-marker-box">
        <div class="city-marker-label">
          <span class="city-name-inline">${city.name}</span>
          <span class="city-temp-inline" style="color: ${color}">${city.temp}°C</span>
        </div>
        <div class="city-point" style="background-color: ${color}; box-shadow: 0 0 14px ${color}"></div>
      </div>
    `,
    iconSize: [110, 42],
    iconAnchor: [55, 36],
  });
}

// ── Map Streamline Particle Class ─────────────────────────────────────────

class MapStreamlineParticle {
  constructor(map) {
    this.reset(map, true);
  }

  reset(map, randomAge = false) {
    const bounds = map.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    this.lat = sw.lat + Math.random() * (ne.lat - sw.lat);
    this.lon = sw.lng + Math.random() * (ne.lng - sw.lng);
    this.age = randomAge ? Math.floor(Math.random() * 90) : 0;
    this.maxAge = 75 + Math.random() * 85;
    this.speed = 0.08 + Math.random() * 0.12;
    this.history = [];
    this.maxHistory = 14 + Math.floor(Math.random() * 8);

    const nLat = (this.lat - 24) / 25;
    const nLon = (this.lon + 125) / 58;
    this.temp = 18 + nLon * 12 + (1 - nLat) * 14;
  }

  update(map, t) {
    this.age++;
    const bounds = map.getBounds();

    if (
      this.age > this.maxAge ||
      this.lat < bounds.getSouth() ||
      this.lat > bounds.getNorth() ||
      this.lon < bounds.getWest() ||
      this.lon > bounds.getEast()
    ) {
      this.reset(map);
      return;
    }

    const nLat = (this.lat - 24) / 25;
    const nLon = (this.lon + 125) / 58;

    const flowAngle = Math.sin(nLon * 4 + t * 0.25) * 0.65 + Math.cos(nLat * 3 - t * 0.18) * 0.4 - 0.1;
    
    let dLat = Math.sin(flowAngle) * this.speed * 0.55;
    let dLon = Math.cos(flowAngle) * this.speed + 0.06;

    const dGlat = this.lat - 28.5;
    const dGlon = this.lon - (-88.0);
    const distG = Math.sqrt(dGlat * dGlat + dGlon * dGlon);
    if (distG < 12) {
      const f = (1 - distG / 12) * 0.06;
      dLat += dGlon * f;
      dLon += -dGlat * f;
    }

    this.lat += dLat;
    this.lon += dLon;

    const point = map.latLngToContainerPoint([this.lat, this.lon]);
    this.history.push(point);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  draw(ctx) {
    if (this.history.length < 2) return;

    const alphaFade = Math.sin((this.age / this.maxAge) * Math.PI);
    const [r, g, b] = tempToRGB(this.temp);

    ctx.beginPath();
    ctx.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 1; i < this.history.length - 1; i++) {
      const xc = (this.history[i].x + this.history[i + 1].x) / 2;
      const yc = (this.history[i].y + this.history[i + 1].y) / 2;
      ctx.quadraticCurveTo(this.history[i].x, this.history[i].y, xc, yc);
    }
    const last = this.history[this.history.length - 1];
    ctx.lineTo(last.x, last.y);

    ctx.strokeStyle = `rgba(${r},${g},${b},${(alphaFade * 0.52).toFixed(3)})`;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(last.x, last.y, 1.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${(alphaFade * 0.90).toFixed(3)})`;
    ctx.fill();
  }
}

function CanvasStreamlineLayer() {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updateSize = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
    };
    updateSize();

    map.on('resize move', updateSize);

    const particles = Array.from({ length: 200 }, () => new MapStreamlineParticle(map));
    let animId;
    const startTime = performance.now();

    const draw = (now) => {
      const t = (now - startTime) * 0.001;
      const size = map.getSize();

      ctx.clearRect(0, 0, size.x, size.y);

      particles.forEach(p => {
        p.update(map, t);
        p.draw(ctx);
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      map.off('resize move', updateSize);
    };
  }, [map]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 400,
      }}
    />
  );
}

// ── Feature Groups Data ───────────────────────────────────────────────────

const ARCHITECTURE = [
  {
    id: 'find-location',
    label: 'FIND A LOCATION',
    Icon: MapPinned,
    features: [
      { label: 'Location Planner',           Icon: Route,               path: '/dashboard/location-planner' },
      { label: 'Location Comparison',        Icon: GitCompareArrows,    path: '/dashboard/location-comparison' },
      { label: 'Business Potential Insights',Icon: ChartNoAxesCombined, path: '/dashboard/business-potential' },
      { label: 'Nearby Activity Explorer',   Icon: MapPin,              path: '/dashboard/nearby-activity' },
    ],
  },
  {
    id: 'heat-conditions',
    label: 'HEAT CONDITIONS',
    Icon: ThermometerSun,
    features: [
      { label: '12-Hour Heat Outlook', Icon: Clock3,    path: '/dashboard/heat-outlook' },
      { label: 'Local Heat Map',       Icon: MapIcon,   path: '/dashboard/local-heat-map' },
      { label: 'Shade Finder',         Icon: Trees,     path: '/dashboard/shade-finder' },
      { label: 'Solar Exposure Map',   Icon: SunMedium, path: '/dashboard/solar-exposure' },
      { label: 'Urban Heat Insights',  Icon: Building2, path: '/dashboard/urban-heat' },
    ],
  },
  {
    id: 'plan-operations',
    label: 'PLAN OPERATIONS',
    Icon: CalendarClock,
    features: [
      { label: 'Operating Window Planner', Icon: CalendarRange, path: '/dashboard/operating-window' },
    ],
  },
  {
    id: 'safety',
    label: 'SAFETY',
    Icon: ShieldCheck,
    features: [
      { label: 'Crew Heat Safety',        Icon: HardHat,      path: '/dashboard/crew-safety' },
      { label: 'Cold Storage Protection', Icon: Refrigerator, path: '/dashboard/cold-storage' },
      { label: 'Food Safety Guard',       Icon: Utensils,     path: '/dashboard/food-safety' },
    ],
  },
  {
    id: 'alerts-risks',
    label: 'ALERTS & RISKS',
    Icon: Siren,
    features: [
      { label: 'Environmental Risk Center',  Icon: CloudSun,      path: '/dashboard/environmental-risk' },
      { label: 'Critical Condition Alerts',  Icon: TriangleAlert, path: '/dashboard/critical-alerts' },
    ],
  },
];

// ── Main LandingPage Component ─────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const archRef   = useRef(null);

  const [archVisible,     setArchVisible]     = useState(false);
  const [catsVisible,     setCatsVisible]     = useState(false);
  const [featVisible,     setFeatVisible]     = useState(false);
  const [checkinVisible,  setCheckinVisible]  = useState(false);

  // Body overflow adjustment
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height   = 'auto';
    return () => {
      document.body.style.overflow = '';
      document.body.style.height   = '';
    };
  }, []);

  // Architecture reveal observer
  useEffect(() => {
    if (!archRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setArchVisible(true);
        setTimeout(() => setCatsVisible(true),    500);
        setTimeout(() => setFeatVisible(true),   1100);
        setTimeout(() => setCheckinVisible(true),1400);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(archRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-root">

      {/* ── SECTION 1: Hero Real Interactive USA Geographic Thermal Map ──── */}
      <section className="landing-hero">
        
        {/* Real Interactive Leaflet Map Wrapper */}
        <div className="hero-leaflet-wrapper">
          <MapContainer
            center={[38.5, -96.0]}
            zoom={4.3}
            zoomControl={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            style={{ height: '100%', width: '100%', background: '#080c14' }}
          >
            {/* CartoDB Dark Matter Base Tiles */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              maxZoom={18}
            />

            {/* Geographically Positioned Thermal Heat Regions */}
            {REAL_THERMAL_REGIONS.map(region => (
              <Circle
                key={region.id}
                center={[region.lat, region.lon]}
                radius={region.radius}
                pathOptions={{
                  color: tempToCSS(region.temp),
                  fillColor: tempToCSS(region.temp),
                  fillOpacity: 0.24,
                  stroke: true,
                  weight: 1,
                  opacity: 0.4,
                }}
              />
            ))}

            {/* Animated Environmental Streamlines Canvas Layer */}
            <CanvasStreamlineLayer />

            {/* 13 Real City Markers at Actual Geographic Positions */}
            {CITIES.map(city => (
              <Marker
                key={city.name}
                position={[city.lat, city.lon]}
                icon={createCityDivIcon(city)}
              >
                <Popup className="custom-city-leaflet-popup">
                  <div className="city-popup-card">
                    <div className="city-popup-header">
                      <strong className="city-popup-name">{city.name}, {city.state}</strong>
                      <span className="city-popup-badge" style={{ color: tempToCSS(city.temp), borderColor: `${tempToCSS(city.temp)}44` }}>
                        {city.status}
                      </span>
                    </div>
                    <div className="city-popup-row">
                      <span className="city-popup-temp" style={{ color: tempToCSS(city.temp) }}>{city.temp}°C</span>
                      <span className="city-popup-aqi">AQI {city.aqi}</span>
                    </div>
                    <div className="city-popup-desc">
                      {city.condition}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Centered Hero Overlay: THERMOSARVA- & LOCAL TEMPERATURE INTELLIGENCE BY FORTYGUARD */}
        <div className="hero-branding">
          <div className="hero-logo-accent">THERMOSARVA-</div>
          <div className="hero-subtitle">
            LOCAL TEMPERATURE INTELLIGENCE BY <span className="fortyguard-accent">FORTYGUARD</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <ChevronDown size={16} strokeWidth={1.5} />
          <span>SCROLL</span>
        </div>
      </section>

      {/* ── SECTION 2: WHAT YOU GET Architecture Section ───────────────── */}
      <section className="what-you-get" ref={archRef}>

        {/* Header */}
        <div className="arch-header-wrap">
          <div className={`arch-section-title${archVisible ? ' lp-visible' : ''}`}>
            THERMOSARVA
          </div>
          <div className={`arch-section-sub${archVisible ? ' lp-visible' : ''}`}>
            WHAT YOU GET
          </div>
        </div>

        {/* Architecture Connector System */}
        <div className={`architecture-connectors${archVisible ? ' lp-visible' : ''}`}>
          <div className="vertical-line" />
          <div className="horizontal-line-wrap">
            <div className="horizontal-line" />
          </div>
          <div className="branch-lines">
            <div className="branch-line" />
            <div className="branch-line" />
            <div className="branch-line" />
            <div className="branch-line" />
            <div className="branch-line" />
          </div>
        </div>

        {/* Horizontal 5-Column Grid */}
        <div className={`architecture-grid${catsVisible ? ' lp-visible' : ''}`}>
          {ARCHITECTURE.map((cat, ci) => (
            <div
              key={cat.id}
              className={`architecture-col ${cat.id === 'plan-operations' ? 'plan-operations-column' : ''}`}
            >
              {/* Category Node Header */}
              <div className="arch-cat-node">
                <cat.Icon size={20} color="var(--brand-primary)" />
                <span className="arch-cat-label">{cat.label}</span>
              </div>

              {/* Vertical Stack of Feature Cards */}
              <div className="arch-features-col">
                {cat.features.map((feat, fi) => (
                  <div
                    key={feat.label}
                    className={`flip-wrap${featVisible ? ' lp-visible' : ''}`}
                    style={{ transitionDelay: `${ci * 0.08 + fi * 0.05}s` }}
                  >
                    <div
                      className="flip-card"
                      title={feat.label}
                      onClick={() => navigate(feat.path)}
                    >
                      <div className="flip-inner">
                        <div className="flip-front">
                          <feat.Icon size={19} />
                        </div>
                        <div className="flip-back">
                          <span className="flip-back-text">{feat.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* CHECK IN button positioned naturally inside PLAN OPERATIONS column */}
                {cat.id === 'plan-operations' && (
                  <div className={`plan-operations-checkin${checkinVisible ? ' lp-visible' : ''}`}>
                    <button
                      className="check-in-button"
                      onClick={() => navigate('/dashboard/location-planner')}
                    >
                      <span>CHECK IN</span>
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );
}
