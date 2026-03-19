// FILE: src/utils/constants.js

export const DEMO_PROJECT = {
  project_name: 'Sai Krupa Residency',
  city: 'Bengaluru',
  project_type: 'residential',
  floors: 3,
  plot_length_ft: 40,
  plot_width_ft: 60,
  builtup_sqft: 5400,
  quality: 'standard',
  vastu: true,
  start_month: 1,
  start_year: 2025,
  soil_type: 'medium',
  bhk_type: '3BHK',
  budget_lakhs: 100,
  deadline_months: 18,
}

export const CITY_OPTIONS = [
  'Bengaluru', 'Mumbai', 'Delhi NCR', 'Pune',
  'Hyderabad', 'Chennai', 'Ahmedabad', 'Kolkata',
]

export const CITY_RATES = {
  'Bengaluru':  { residential: 2100, commercial: 2800 },
  'Delhi NCR':  { residential: 2400, commercial: 3200 },
  'Mumbai':     { residential: 2650, commercial: 3500 },
  'Pune':       { residential: 1950, commercial: 2600 },
  'Hyderabad':  { residential: 1850, commercial: 2450 },
  'Chennai':    { residential: 2000, commercial: 2650 },
  'Ahmedabad':  { residential: 1700, commercial: 2250 },
  'Kolkata':    { residential: 1600, commercial: 2100 },
  'Tier-2':     { residential: 1450, commercial: 1900 },
}

export const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',      icon: 'LayoutDashboard' },
  { id: 'floorplan',  label: 'Floor Plan',     icon: 'Grid3X3' },
  { id: 'estimator',  label: 'Estimator',      icon: 'IndianRupee' },
  { id: 'whatif',     label: 'What-If',        icon: 'SlidersHorizontal' },
  { id: 'schedule',   label: 'Schedule',       icon: 'CalendarDays' },
  { id: 'cascade',    label: 'Delay Cascade',  icon: 'Zap' },
  { id: 'risks',      label: 'Risk Engine',    icon: 'Shield' },
  { id: 'reverse',    label: 'Reverse Plan',   icon: 'ArrowLeftRight' },
  { id: 'materials',  label: 'Material Swap',  icon: 'Layers' },
  { id: 'resources',  label: 'Resources',      icon: 'Users' },
]

export const QUALITY_OPTIONS = [
  { value: 'economy',  label: 'Economy',  range: '₹1,400–1,700/sqft' },
  { value: 'standard', label: 'Standard', range: '₹1,700–2,200/sqft' },
  { value: 'premium',  label: 'Premium',  range: '₹2,200–3,000/sqft' },
  { value: 'luxury',   label: 'Luxury',   range: '₹3,000–4,500/sqft' },
]

export const BHK_OPTIONS = ['1BHK', '2BHK', '3BHK']

export const COPILOT_CHIPS = [
  'What IS code for M25 concrete?',
  'Monsoon impact on my schedule?',
  'How to reduce steel cost?',
  'RERA compliance checklist',
  'Foundation type for soft soil?',
  'Best masonry for Bengaluru?',
]

export const BOQ_COMPONENTS = {
  'Civil & Structure': 0.42,
  'Finishes & Interior': 0.24,
  'MEP (Electrical + Plumbing)': 0.18,
  'Labour': 0.10,
  'Contingency': 0.06,
}

export const PHASE_TEMPLATES = [
  { name: 'Excavation & Foundation',  base_weeks: 6,  depends_on: [],    outdoor: true  },
  { name: 'Superstructure RCC',       base_weeks: 10, depends_on: [0],   outdoor: true  },
  { name: 'Masonry & Plastering',     base_weeks: 8,  depends_on: [1],   outdoor: false },
  { name: 'MEP Rough-in',            base_weeks: 6,  depends_on: [1],   outdoor: false },
  { name: 'Finishes & Handover',     base_weeks: 10, depends_on: [2,3], outdoor: false },
]

export const MONSOON_MONTHS = {
  'Bengaluru': [6,7,8,9], 'Mumbai': [6,7,8,9], 'Delhi NCR': [7,8,9],
  'Chennai': [10,11], 'Hyderabad': [6,7,8,9], 'Pune': [6,7,8,9],
  'Kolkata': [6,7,8,9], 'Ahmedabad': [6,7,8],
}

export const ROOM_COLORS = {
  hall: 'rgba(59,130,246,0.18)', dining: 'rgba(59,130,246,0.12)',
  master_bed: 'rgba(139,92,246,0.18)', bed2: 'rgba(0,200,150,0.14)',
  bed3: 'rgba(0,200,150,0.10)', kitchen: 'rgba(245,158,11,0.18)',
  bath1: 'rgba(71,85,105,0.22)', bath2: 'rgba(71,85,105,0.22)',
  bathroom: 'rgba(71,85,105,0.22)', utility: 'rgba(71,85,105,0.15)',
  balcony: 'rgba(34,197,94,0.12)', toilet: 'rgba(71,85,105,0.20)',
  passage: 'rgba(71,85,105,0.10)',
}

// Client-side material data (fallback when backend unavailable)
export const MATERIALS_DATA = {
  masonry: [
    { id: 'clay_brick', name: 'Traditional Clay Brick', is_code: 'IS 1077', unit: 'per 1000', base_cost: 7500, time_delta_weeks: 0, strength_pct: 100, thermal_score: 3, availability_pct: 95, is_baseline: true },
    { id: 'aac_block', name: 'AAC Block (Autoclaved)', is_code: 'IS 2185 Part 1', unit: 'per m³', base_cost: 6600, time_delta_weeks: -1, strength_pct: 85, thermal_score: 8, availability_pct: 80, is_baseline: false },
    { id: 'fly_ash_brick', name: 'Fly Ash Brick', is_code: 'IS 12894', unit: 'per 1000', base_cost: 5500, time_delta_weeks: 0, strength_pct: 90, thermal_score: 5, availability_pct: 85, is_baseline: false },
  ],
  cement: [
    { id: 'opc_53', name: 'OPC 53 Grade', is_code: 'IS 12269', unit: 'per bag', base_cost: 380, time_delta_weeks: 0, strength_pct: 100, thermal_score: 3, availability_pct: 95, is_baseline: true },
    { id: 'ppc', name: 'Portland Pozzolana (PPC)', is_code: 'IS 1489', unit: 'per bag', base_cost: 340, time_delta_weeks: 1, strength_pct: 92, thermal_score: 5, availability_pct: 92, is_baseline: false },
    { id: 'psc', name: 'Portland Slag Cement', is_code: 'IS 455', unit: 'per bag', base_cost: 350, time_delta_weeks: 1, strength_pct: 95, thermal_score: 4, availability_pct: 70, is_baseline: false },
  ],
  steel: [
    { id: 'fe500d', name: 'Fe-500D TMT Bar', is_code: 'IS 1786', unit: 'per tonne', base_cost: 62000, time_delta_weeks: 0, strength_pct: 100, thermal_score: 0, availability_pct: 95, is_baseline: true },
    { id: 'fe415', name: 'Fe-415 TMT Bar', is_code: 'IS 1786', unit: 'per tonne', base_cost: 56000, time_delta_weeks: 0, strength_pct: 83, thermal_score: 0, availability_pct: 90, is_baseline: false },
    { id: 'fe550d', name: 'Fe-550D TMT Bar', is_code: 'IS 1786', unit: 'per tonne', base_cost: 68000, time_delta_weeks: -1, strength_pct: 110, thermal_score: 0, availability_pct: 60, is_baseline: false },
  ],
  roofing: [
    { id: 'rcc_slab', name: 'RCC Flat Slab', is_code: 'IS 456', unit: 'per sqm', base_cost: 2200, time_delta_weeks: 0, strength_pct: 100, thermal_score: 4, availability_pct: 95, is_baseline: true },
    { id: 'filler_slab', name: 'Filler Slab (Clay pots)', is_code: 'IS 456', unit: 'per sqm', base_cost: 1600, time_delta_weeks: 1, strength_pct: 80, thermal_score: 7, availability_pct: 60, is_baseline: false },
  ],
}
