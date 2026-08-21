// ──────────────────────────────────────────────
//  THERMOSARVA — Centralised Mock Data
// ──────────────────────────────────────────────

// Candidate locations (food-truck hot spots)
export const candidateLocations = [
  {
    id: 'loc-1',
    name: 'Tech Corridor, Whitefield',
    lat: 12.9698,
    lng: 77.7499,
    score: 87,
    heatIndex: 38,
    shade: 'Moderate',
    businessPotential: 91,
    nearbyPOI: 14,
    solarExposure: 'High',
    urbanHeat: 'Elevated',
    status: 'good',
  },
  {
    id: 'loc-2',
    name: 'Market Hub, Koramangala',
    lat: 12.9352,
    lng: 77.6245,
    score: 79,
    heatIndex: 41,
    shade: 'Low',
    businessPotential: 85,
    nearbyPOI: 21,
    solarExposure: 'Very High',
    urbanHeat: 'High',
    status: 'caution',
  },
  {
    id: 'loc-3',
    name: 'University Zone, Indiranagar',
    lat: 12.9784,
    lng: 77.6408,
    score: 93,
    heatIndex: 33,
    shade: 'High',
    businessPotential: 94,
    nearbyPOI: 18,
    solarExposure: 'Moderate',
    urbanHeat: 'Moderate',
    status: 'best',
  },
  {
    id: 'loc-4',
    name: 'Transit Node, Majestic',
    lat: 12.9767,
    lng: 77.5713,
    score: 62,
    heatIndex: 44,
    shade: 'Very Low',
    businessPotential: 70,
    nearbyPOI: 31,
    solarExposure: 'Extreme',
    urbanHeat: 'Very High',
    status: 'critical',
  },
];

// 12-hour temperature / heat index timeline (hourly from 6 AM)
export const heatOutlookData = [
  { hour: '6 AM',  temp: 27, heatIndex: 29, uvIndex: 2,  risk: 'low' },
  { hour: '7 AM',  temp: 29, heatIndex: 31, uvIndex: 3,  risk: 'low' },
  { hour: '8 AM',  temp: 31, heatIndex: 33, uvIndex: 5,  risk: 'low' },
  { hour: '9 AM',  temp: 33, heatIndex: 36, uvIndex: 6,  risk: 'moderate' },
  { hour: '10 AM', temp: 35, heatIndex: 39, uvIndex: 8,  risk: 'moderate' },
  { hour: '11 AM', temp: 37, heatIndex: 42, uvIndex: 9,  risk: 'high' },
  { hour: '12 PM', temp: 39, heatIndex: 45, uvIndex: 10, risk: 'high' },
  { hour: '1 PM',  temp: 40, heatIndex: 47, uvIndex: 10, risk: 'critical' },
  { hour: '2 PM',  temp: 41, heatIndex: 48, uvIndex: 9,  risk: 'critical' },
  { hour: '3 PM',  temp: 40, heatIndex: 46, uvIndex: 8,  risk: 'high' },
  { hour: '4 PM',  temp: 38, heatIndex: 43, uvIndex: 6,  risk: 'moderate' },
  { hour: '5 PM',  temp: 35, heatIndex: 39, uvIndex: 4,  risk: 'moderate' },
];

// Business potential categories
export const businessCategories = [
  { category: 'Office Workers', score: 88, count: 3200, icon: 'Briefcase' },
  { category: 'College Students', score: 94, count: 1800, icon: 'GraduationCap' },
  { category: 'Commuters', score: 76, count: 2400, icon: 'Train' },
  { category: 'Market Shoppers', score: 82, count: 1500, icon: 'ShoppingBag' },
  { category: 'Tourists', score: 65, count: 600, icon: 'Camera' },
  { category: 'Residents', score: 71, count: 4200, icon: 'Home' },
];

// Nearby activity data
export const nearbyActivityData = [
  { name: 'IT Park Alpha', type: 'Office', distance: '120m', demand: 'Very High', lat: 12.9705, lng: 77.7510 },
  { name: 'Prestige Tech Park', type: 'Office', distance: '250m', demand: 'High', lat: 12.9720, lng: 77.7490 },
  { name: 'Christ University', type: 'College', distance: '400m', demand: 'Very High', lat: 12.9680, lng: 77.7520 },
  { name: 'Whitefield Market', type: 'Market', distance: '600m', demand: 'High', lat: 12.9670, lng: 77.7480 },
  { name: 'Whitefield Metro', type: 'Transit', distance: '350m', demand: 'High', lat: 12.9700, lng: 77.7530 },
  { name: 'Food Court Hub', type: 'Commercial', distance: '180m', demand: 'Medium', lat: 12.9715, lng: 77.7505 },
];

// Operating window recommendation
export const operatingWindowData = {
  recommended: { start: '7:30 AM', end: '11:00 AM', label: 'Morning Window' },
  secondary: { start: '5:00 PM', end: '7:30 PM', label: 'Evening Window' },
  avoidStart: '11:30 AM',
  avoidEnd: '4:30 PM',
  avoidLabel: 'Peak Heat — Avoid',
  peakBusiness: '8:00 AM - 9:30 AM',
  timeline: [
    { hour: '6 AM',  business: 30, safety: 95, composite: 55 },
    { hour: '7 AM',  business: 55, safety: 92, composite: 72 },
    { hour: '8 AM',  business: 85, safety: 88, composite: 87 },
    { hour: '9 AM',  business: 90, safety: 80, composite: 86 },
    { hour: '10 AM', business: 75, safety: 68, composite: 72 },
    { hour: '11 AM', business: 60, safety: 50, composite: 55 },
    { hour: '12 PM', business: 50, safety: 30, composite: 40 },
    { hour: '1 PM',  business: 40, safety: 15, composite: 27 },
    { hour: '2 PM',  business: 35, safety: 12, composite: 24 },
    { hour: '3 PM',  business: 40, safety: 20, composite: 30 },
    { hour: '4 PM',  business: 55, safety: 40, composite: 48 },
    { hour: '5 PM',  business: 80, safety: 65, composite: 73 },
    { hour: '6 PM',  business: 88, safety: 80, composite: 84 },
    { hour: '7 PM',  business: 70, safety: 88, composite: 79 },
  ],
};

// Crew heat safety
export const crewSafetyData = {
  currentRisk: 'Elevated',
  heatIndex: 41,
  exposure: '2h 30m',
  nextBreak: '15 min',
  hydrationAlert: true,
  guidelines: [
    { label: 'Water intake', value: '250ml every 20 min', status: 'warning' },
    { label: 'Rest period', value: '10 min per hour', status: 'ok' },
    { label: 'Shade access', value: 'Required', status: 'warning' },
    { label: 'Heat illness signs', value: 'Monitor actively', status: 'critical' },
  ],
  hourlyExposure: [
    { hour: '8 AM', risk: 20, label: 'Low' },
    { hour: '9 AM', risk: 35, label: 'Moderate' },
    { hour: '10 AM', risk: 55, label: 'Elevated' },
    { hour: '11 AM', risk: 72, label: 'High' },
    { hour: '12 PM', risk: 88, label: 'Critical' },
    { hour: '1 PM', risk: 95, label: 'Critical' },
  ],
};

// Cold storage protection
export const coldStorageData = {
  truckTemp: 4.2,
  externalTemp: 39,
  differential: 34.8,
  compressorLoad: 87,
  status: 'warning',
  riskHours: ['11 AM', '12 PM', '1 PM', '2 PM'],
  items: [
    { name: 'Dairy Products', tempRequired: '≤ 4°C', currentRisk: 'High', status: 'warning' },
    { name: 'Beverages', tempRequired: '≤ 8°C', currentRisk: 'Medium', status: 'ok' },
    { name: 'Frozen Items', tempRequired: '≤ -18°C', currentRisk: 'Critical', status: 'critical' },
    { name: 'Fresh Produce', tempRequired: '≤ 10°C', currentRisk: 'Low', status: 'ok' },
  ],
  forecast: [
    { hour: '8 AM', external: 31, internal: 4, load: 45 },
    { hour: '9 AM', external: 34, internal: 4, load: 58 },
    { hour: '10 AM', external: 37, internal: 4.1, load: 71 },
    { hour: '11 AM', external: 39, internal: 4.3, load: 83 },
    { hour: '12 PM', external: 41, internal: 4.5, load: 91 },
    { hour: '1 PM', external: 42, internal: 4.8, load: 95 },
  ],
};

// Food safety
export const foodSafetyData = {
  dangerZoneTemp: { min: 5, max: 60 },
  currentAmbient: 39,
  dangerZoneRisk: 'High',
  guidelines: [
    { item: 'Hot Foods', requirement: 'Keep above 60°C', status: 'ok', note: 'Verified' },
    { item: 'Cold Foods', requirement: 'Keep below 5°C', status: 'warning', note: 'At risk in peak hours' },
    { item: 'Ready-to-eat', requirement: 'Max 2hr exposure', status: 'warning', note: '1h 45m elapsed' },
    { item: 'Raw Proteins', requirement: 'Separate storage', status: 'ok', note: 'Compliant' },
  ],
  riskByHour: [
    { hour: '8 AM', risk: 25 }, { hour: '9 AM', risk: 35 },
    { hour: '10 AM', risk: 50 }, { hour: '11 AM', risk: 68 },
    { hour: '12 PM', risk: 82 }, { hour: '1 PM', risk: 91 },
    { hour: '2 PM', risk: 88 }, { hour: '3 PM', risk: 75 },
    { hour: '4 PM', risk: 60 }, { hour: '5 PM', risk: 40 },
  ],
};

// Environmental risk center
export const environmentalRiskData = {
  overallRisk: 'High',
  riskScore: 74,
  conditions: [
    { label: 'Air Temperature', value: '41°C', status: 'critical', icon: 'Thermometer' },
    { label: 'UV Index', value: '9 (Very High)', status: 'critical', icon: 'Sun' },
    { label: 'Humidity', value: '62%', status: 'warning', icon: 'Droplets' },
    { label: 'Wind Speed', value: '6 km/h', status: 'ok', icon: 'Wind' },
    { label: 'Air Quality (AQI)', value: '142 (Unhealthy)', status: 'warning', icon: 'CloudSun' },
    { label: 'Solar Radiation', value: '850 W/m²', status: 'critical', icon: 'SunMedium' },
  ],
  riskAreas: [
    { name: 'Crew Health', score: 78, trend: 'worsening' },
    { name: 'Cold Storage', score: 82, trend: 'worsening' },
    { name: 'Food Safety', score: 68, trend: 'stable' },
    { name: 'Equipment', score: 55, trend: 'stable' },
  ],
};

// Critical alerts
export const criticalAlertsData = [
  {
    id: 'alert-1',
    severity: 'critical',
    title: 'Extreme Heat Warning',
    message: 'Heat index exceeding 48°C between 1 PM – 2 PM. Suspend outdoor operations.',
    time: '2 min ago',
    category: 'Heat',
    icon: 'Thermometer',
    actionRequired: true,
  },
  {
    id: 'alert-2',
    severity: 'critical',
    title: 'Cold Storage Failure Risk',
    message: 'Compressor at 95% load. Frozen items may exceed safe temperature within 45 minutes.',
    time: '5 min ago',
    category: 'Equipment',
    icon: 'Refrigerator',
    actionRequired: true,
  },
  {
    id: 'alert-3',
    severity: 'warning',
    title: 'Crew Heat Exposure Limit Approaching',
    message: 'Crew member(s) approaching maximum safe continuous heat exposure. Schedule break.',
    time: '12 min ago',
    category: 'Crew Safety',
    icon: 'HardHat',
    actionRequired: true,
  },
  {
    id: 'alert-4',
    severity: 'warning',
    title: 'Food Safety Timer — Ready-to-Eat Items',
    message: 'Ready-to-eat items have been in ambient conditions for 1h 45m. 15 minutes remaining.',
    time: '18 min ago',
    category: 'Food Safety',
    icon: 'Utensils',
    actionRequired: false,
  },
  {
    id: 'alert-5',
    severity: 'info',
    title: 'Evening Window Opening in 2 Hours',
    message: 'Safe operating conditions expected from 5:00 PM. Begin preparation at 4:30 PM.',
    time: '25 min ago',
    category: 'Operations',
    icon: 'CalendarRange',
    actionRequired: false,
  },
];

// Urban heat insights
export const urbanHeatData = {
  surfaceTemp: 52,
  airTemp: 41,
  greenCoverage: '12%',
  imperviousSurface: '78%',
  heatIslandIntensity: 'High',
  factors: [
    { label: 'Concrete surfaces', contribution: 35, impact: 'Stores and radiates heat' },
    { label: 'Low vegetation', contribution: 28, impact: 'Reduced evapotranspiration' },
    { label: 'Vehicle density', contribution: 22, impact: 'Engine heat + exhaust' },
    { label: 'Building density', contribution: 15, impact: 'Reduced air circulation' },
  ],
  comparisonAreas: [
    { name: 'Current Location', temp: 41, type: 'Urban Core' },
    { name: 'Indiranagar (3km)', temp: 37, type: 'Mixed' },
    { name: 'Cubbon Park (5km)', temp: 32, type: 'Green Zone' },
    { name: 'Whitefield Outskirts', temp: 35, type: 'Suburban' },
  ],
};

// Shade finder data
export const shadeFinderData = [
  { name: 'Spot A — Under Banyan Canopy', shadeHours: 8, morningShade: true, afternoonShade: true, shadeScore: 92, lat: 12.9701, lng: 77.7495 },
  { name: 'Spot B — Building East Side', shadeHours: 5, morningShade: true, afternoonShade: false, shadeScore: 68, lat: 12.9706, lng: 77.7502 },
  { name: 'Spot C — Open Lot', shadeHours: 0, morningShade: false, afternoonShade: false, shadeScore: 12, lat: 12.9692, lng: 77.7508 },
  { name: 'Spot D — Covered Walkway', shadeHours: 10, morningShade: true, afternoonShade: true, shadeScore: 96, lat: 12.9712, lng: 77.7488 },
];

// Solar exposure map data
export const solarExposureData = [
  { hour: '6 AM',  radiation: 120, uvIndex: 2 },
  { hour: '7 AM',  radiation: 280, uvIndex: 3 },
  { hour: '8 AM',  radiation: 420, uvIndex: 5 },
  { hour: '9 AM',  radiation: 580, uvIndex: 6 },
  { hour: '10 AM', radiation: 680, uvIndex: 8 },
  { hour: '11 AM', radiation: 780, uvIndex: 9 },
  { hour: '12 PM', radiation: 850, uvIndex: 10 },
  { hour: '1 PM',  radiation: 820, uvIndex: 10 },
  { hour: '2 PM',  radiation: 750, uvIndex: 9 },
  { hour: '3 PM',  radiation: 640, uvIndex: 7 },
  { hour: '4 PM',  radiation: 480, uvIndex: 5 },
  { hour: '5 PM',  radiation: 280, uvIndex: 3 },
];
