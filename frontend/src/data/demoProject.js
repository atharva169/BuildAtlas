// FILE: src/data/demoProject.js
// ═══════════════════════════════════════════════════════════════════════
// BuildAtlas GenAI — Complete Pre-computed Demo Project
// "Sharma Residence — G+2", Bengaluru, 12m × 9m, East Facing, 2BHK
// This file is the offline fallback. If the API is down, the entire
// demo runs from this data.
// ═══════════════════════════════════════════════════════════════════════

// ── Project Input ─────────────────────────────────────────────────────

export const DEMO_PROJECT_INPUT = {
  project_name: 'Sharma Residence — G+2',
  city: 'Bengaluru',
  project_type: 'residential',
  floors: 3,                  // G + 2
  plot_length_ft: 39.37,      // 12m ≈ 39.37 ft
  plot_width_ft: 29.53,       // 9m ≈ 29.53 ft
  builtup_sqft: 3484,         // ~324 sqm × 3 floors × 0.358 coverage
  quality: 'standard',
  vastu: true,
  start_month: 6,             // June 2025
  start_year: 2025,
  soil_type: 'medium',
  bhk_type: '2BHK',
  budget_lakhs: 180,          // ₹1.8 Crore target
  deadline_months: 18,
  facing: 'East',
}


// ── Floor Plan Layout ─────────────────────────────────────────────────

export const DEMO_FLOOR_PLAN = {
  plot_length_ft: 39.37,
  plot_width_ft: 29.53,
  usable_length: 35.37,       // 2 ft setback each side
  usable_width: 25.53,
  carpet_area_sqft: 2710,
  vastu_applied: true,
  warnings: [],
  rooms: [
    {
      room_type: 'hall',
      label: 'Living / Drawing Room',
      x: 2, y: 2, width: 16, height: 13,
      area_sqft: 208,
      zone: 'social',
      vastu_direction: 'North-East',
    },
    {
      room_type: 'dining',
      label: 'Dining Area',
      x: 18, y: 2, width: 10, height: 10,
      area_sqft: 100,
      zone: 'social',
      vastu_direction: 'West',
    },
    {
      room_type: 'kitchen',
      label: 'Kitchen',
      x: 28, y: 2, width: 9.37, height: 10,
      area_sqft: 93.7,
      zone: 'service',
      vastu_direction: 'South-East',       // Agni corner — Vastu compliant
    },
    {
      room_type: 'master_bed',
      label: 'Master Bedroom',
      x: 2, y: 15, width: 14, height: 12.53,
      area_sqft: 175.4,
      zone: 'private',
      vastu_direction: 'South-West',
    },
    {
      room_type: 'bed2',
      label: 'Bedroom 2',
      x: 16, y: 15, width: 12, height: 12.53,
      area_sqft: 150.4,
      zone: 'private',
      vastu_direction: 'North-West',
    },
    {
      room_type: 'bath1',
      label: 'Master Bath (Attached)',
      x: 2, y: 12, width: 7, height: 5,
      area_sqft: 35,
      zone: 'service',
      vastu_direction: 'West',
    },
    {
      room_type: 'bath2',
      label: 'Common Bathroom',
      x: 28, y: 12, width: 7, height: 5,
      area_sqft: 35,
      zone: 'service',
      vastu_direction: 'North-West',
    },
    {
      room_type: 'utility',
      label: 'Utility / Wash Area',
      x: 28, y: 17, width: 9.37, height: 5,
      area_sqft: 46.9,
      zone: 'service',
      vastu_direction: 'South',
    },
    {
      room_type: 'balcony',
      label: 'Front Balcony',
      x: 2, y: 0, width: 12, height: 2,
      area_sqft: 24,
      zone: 'social',
      vastu_direction: 'East',
    },
    {
      room_type: 'passage',
      label: 'Passage / Corridor',
      x: 14, y: 12, width: 14, height: 3,
      area_sqft: 42,
      zone: 'social',
      vastu_direction: null,
    },
    {
      room_type: 'staircase',
      label: 'Staircase',
      x: 28, y: 22, width: 9.37, height: 5.53,
      area_sqft: 51.8,
      zone: 'service',
      vastu_direction: 'South-West',
    },
    {
      room_type: 'pooja',
      label: 'Pooja Room',
      x: 9, y: 12, width: 5, height: 3,
      area_sqft: 15,
      zone: 'private',
      vastu_direction: 'North-East',
    },
  ],
}


// ── Cost Estimate ─────────────────────────────────────────────────────

export const DEMO_COST_ESTIMATE = {
  total: {
    p10: 155.2,       // ₹1.55 Cr — optimistic
    p50: 184.0,       // ₹1.84 Cr — most-likely
    p90: 231.4,       // ₹2.31 Cr — pessimistic
  },
  cost_per_sqft: {
    p10: 1780,
    p50: 2100,
    p90: 2640,
  },
  city: 'Bengaluru',
  city_rate_used: 2100,
  quality_multiplier: 1.0,
  structural_multiplier: 1.15,
  variance_driver: 'TMT Steel (Fe-500D) — primary variance driver due to commodity price volatility',
  boq: [
    { sno: 1,  category: 'Excavation & Foundation',          percentage: 8.5,  amount_lakhs: 15.64 },
    { sno: 2,  category: 'RCC Superstructure',                percentage: 18.2, amount_lakhs: 33.49 },
    { sno: 3,  category: 'TMT Steel (Fe-500D)',               percentage: 14.8, amount_lakhs: 27.23 },
    { sno: 4,  category: 'Brickwork & Masonry',               percentage: 7.2,  amount_lakhs: 13.25 },
    { sno: 5,  category: 'Plastering & Waterproofing',        percentage: 6.1,  amount_lakhs: 11.22 },
    { sno: 6,  category: 'Flooring & Tiling',                 percentage: 8.4,  amount_lakhs: 15.46 },
    { sno: 7,  category: 'Electrical & Wiring',               percentage: 7.5,  amount_lakhs: 13.80 },
    { sno: 8,  category: 'Plumbing & Sanitary',               percentage: 6.8,  amount_lakhs: 12.51 },
    { sno: 9,  category: 'Doors, Windows & Joinery',          percentage: 5.9,  amount_lakhs: 10.86 },
    { sno: 10, category: 'Painting & Finishes',               percentage: 5.6,  amount_lakhs: 10.30 },
    { sno: 11, category: 'Labour & Supervision',              percentage: 6.0,  amount_lakhs: 11.04 },
    { sno: 12, category: 'Contingency & Approvals',           percentage: 5.0,  amount_lakhs: 9.20  },
  ],
}


// ── Schedule ──────────────────────────────────────────────────────────

export const DEMO_SCHEDULE = {
  project_start: '2025-06-01',
  project_end: '2026-12-15',
  total_weeks: 80,
  total_months: 18.5,
  phases: [
    {
      index: 0,
      name: 'Excavation & Foundation',
      base_weeks: 6,
      adjusted_weeks: 10,        // +4 weeks monsoon buffer (Jun–Sep)
      start_date: '2025-06-01',
      end_date: '2025-08-09',
      depends_on: [],
      is_outdoor: true,
      is_critical: true,
      monsoon_delay_weeks: 4,
      status: 'BLOCKED',         // Monsoon overlap
    },
    {
      index: 1,
      name: 'Superstructure RCC',
      base_weeks: 10,
      adjusted_weeks: 14,        // +4 weeks monsoon + floor multiplier
      start_date: '2025-08-10',
      end_date: '2025-11-15',
      depends_on: [0],
      is_outdoor: true,
      is_critical: true,
      monsoon_delay_weeks: 4,
      status: 'PARTIAL',
    },
    {
      index: 2,
      name: 'Masonry & Plastering',
      base_weeks: 8,
      adjusted_weeks: 10,        // +2 weeks floor multiplier
      start_date: '2025-11-16',
      end_date: '2026-01-24',
      depends_on: [1],
      is_outdoor: false,
      is_critical: true,
      monsoon_delay_weeks: 0,
      status: 'FREE',
    },
    {
      index: 3,
      name: 'MEP Rough-in (Electrical + Plumbing)',
      base_weeks: 6,
      adjusted_weeks: 8,
      start_date: '2025-11-16',
      end_date: '2026-01-10',
      depends_on: [1],
      is_outdoor: false,
      is_critical: false,
      monsoon_delay_weeks: 0,
      status: 'FREE',
    },
    {
      index: 4,
      name: 'Finishes & Handover',
      base_weeks: 10,
      adjusted_weeks: 12,
      start_date: '2026-01-25',
      end_date: '2026-04-18',
      depends_on: [2, 3],
      is_outdoor: false,
      is_critical: true,
      monsoon_delay_weeks: 0,
      status: 'FREE',
    },
  ],
  critical_path_indices: [0, 1, 2, 4],
  monsoon_lockout_weeks: 8,
  approval_wait_weeks: 4,        // BBMP approval lead time
}


// ── Resources ─────────────────────────────────────────────────────────

export const DEMO_RESOURCES = {
  total_labour_days: 4200,
  peak_workforce: 35,
  total_labour_cost_lakhs: 11.04,
  resources: [
    {
      phase_name: 'Excavation & Foundation',
      crew: { 'Site Engineer': 1, 'Mason (Head)': 2, 'Helper': 8, 'Machine Operator': 2, 'Surveyor': 1 },
      equipment: ['JCB Excavator', 'Concrete Mixer', 'Vibrator Needle', 'Dumper', 'Water Pump'],
      daily_labour_cost: 18500,
    },
    {
      phase_name: 'Superstructure RCC',
      crew: { 'Site Engineer': 1, 'Bar Bender': 4, 'Carpenter (Shuttering)': 4, 'Mason': 3, 'Helper': 12, 'Crane Operator': 1 },
      equipment: ['Tower Crane (mini)', 'Bar Bending Machine', 'Concrete Pump', 'Shuttering Plates', 'Safety Nets'],
      daily_labour_cost: 32000,
    },
    {
      phase_name: 'Masonry & Plastering',
      crew: { 'Site Engineer': 1, 'Mason': 6, 'Helper': 8, 'Plumber (embed)': 1 },
      equipment: ['Scaffolding Set', 'Mortar Mixer', 'Spirit Level Laser', 'Block Cutter'],
      daily_labour_cost: 22000,
    },
    {
      phase_name: 'MEP Rough-in',
      crew: { 'Electrical Supervisor': 1, 'Electrician': 3, 'Plumber': 3, 'Helper': 4 },
      equipment: ['Pipe Threading Machine', 'Cable Pulling Kit', 'Pressure Tester', 'Conduit Bender'],
      daily_labour_cost: 16000,
    },
    {
      phase_name: 'Finishes & Handover',
      crew: { 'Interior Supervisor': 1, 'Tile Mason': 4, 'Painter': 4, 'Carpenter (Joinery)': 3, 'Helper': 6, 'Electrician (Final)': 2 },
      equipment: ['Tile Cutter', 'Spray Paint Gun', 'Sanding Machine', 'Glass Cutter', 'Cleaning Equipment'],
      daily_labour_cost: 28000,
    },
  ],
}


// ── Risks ─────────────────────────────────────────────────────────────

export const DEMO_RISKS = {
  overall_score: 5.8,
  top_risks: ['RISK_MONSOON', 'RISK_STEEL_VOL', 'RISK_APPROVAL'],
  risks: [
    {
      risk_id: 'RISK_MONSOON',
      category: 'Weather',
      title: 'Bengaluru Monsoon Disruption (Jun–Sep)',
      score: 7.8,
      weight: 0.25,
      severity: 'critical',
      mitigation: 'Schedule outdoor phases (excavation, RCC) to minimize monsoon overlap. Pre-cure foundations before peak rains. Maintain tarpaulin stock for emergency coverage.',
      ai_narrative: 'Bengaluru receives 970mm average rainfall during Jun–Sep. The project starts June 2025, placing excavation and foundation work directly in the monsoon window. Historical data shows 23% average productivity loss for outdoor construction in Bengaluru during these months. A 4-week buffer has been applied to outdoor phases. Recommend completing DPC level before July 15 to avoid waterlogging in open foundations.',
    },
    {
      risk_id: 'RISK_STEEL_VOL',
      category: 'Material Cost',
      title: 'TMT Steel Price Volatility',
      score: 6.9,
      weight: 0.22,
      severity: 'critical',
      mitigation: 'Lock steel prices via advance purchase orders for 60% of requirement at current ₹62,000/tonne. Consider Fe-415 substitution for non-critical members per IS 1786.',
      ai_narrative: 'TMT Fe-500D steel constitutes 14.8% of total project cost (₹27.23L). Historical 12-month price swing: ±18%. A 15% increase would add ₹4.08L to the project. The P10–P90 spread in the cost estimate is primarily driven by steel volatility. Recommend procurement in Q3 2025 when historically prices dip post-monsoon.',
    },
    {
      risk_id: 'RISK_APPROVAL',
      category: 'Regulatory',
      title: 'BBMP Building Plan Approval Delay',
      score: 6.2,
      weight: 0.20,
      severity: 'critical',
      mitigation: 'File building plan application 8 weeks before construction start. Engage licensed architect for BBMP-format drawings. Keep 4-week buffer for approval wait.',
      ai_narrative: 'BBMP (Bruhat Bengaluru Mahanagara Palike) average approval TAT is 45–60 days for residential G+2. The critical path cannot begin until foundation approval is received. A 4-week approval buffer is included in the schedule. Engaging a BBMP-empanelled architect reduces rejection probability by ~40%.',
    },
    {
      risk_id: 'RISK_LABOUR',
      category: 'Workforce',
      title: 'Skilled Labour Shortage During Peak',
      score: 5.1,
      weight: 0.18,
      severity: 'medium',
      mitigation: 'Retain core mason and bar-bender teams on monthly contract. Cross-train helpers for basic shuttering. Maintain 15% labour buffer.',
      ai_narrative: 'Bengaluru construction sector experiences 15–20% labour attrition during peak season (Oct–Mar). For a G+2 project peaking at 35 workers, expect 5–7 workers to be unavailable at any time. Monthly retention contracts cost ~8% premium but eliminate re-hiring delays of 1–2 weeks per replacement cycle.',
    },
    {
      risk_id: 'RISK_SOIL',
      category: 'Geotechnical',
      title: 'Unexpected Soil Condition at Foundation',
      score: 3.4,
      weight: 0.15,
      severity: 'low',
      mitigation: 'Conduct soil test before excavation. For medium soil, isolated footings are adequate per IS 1904. If soft patches found, switch to pile foundation with ₹3–5L additional cost.',
      ai_narrative: 'A medium soil classification in Bengaluru typically has SBC (Safe Bearing Capacity) of 15–20 T/sqm. For a G+2 residential with ~12m plot width, isolated footings at 1.2m depth are standard per IS 1904. Risk is low but non-zero: ~8% of Bengaluru residential sites encounter localized soft pockets requiring design revision. A ₹15,000 soil investigation eliminates this uncertainty.',
    },
  ],
}


// ── Compliance ────────────────────────────────────────────────────────

export const DEMO_COMPLIANCE = {
  city: 'Bengaluru',
  applicable_bodies: ['BBMP', 'BWSSB', 'BESCOM', 'KSPCB'],
  total_items: 4,
  mandatory_count: 4,
  items: [
    {
      item: 'BBMP Building Plan Sanction',
      mandatory: true,
      ref: 'KMBR 2020, Rule 13 — Revised Master Plan 2031',
      status: 'pending',
      tat_days: 45,
      description: 'Submit structural drawings, site plan, and ownership documents to BBMP zonal office. Required before foundation work. Online submission via BBMP Sakala portal.',
    },
    {
      item: 'BWSSB Water & Sewer Connection',
      mandatory: true,
      ref: 'BWSSB Bylaws — Section 28',
      status: 'pending',
      tat_days: 30,
      description: 'Apply for water supply and sewage connection. 1-inch connection for residential G+2. ₹18,000–25,000 fee. Must be in place before plumbing rough-in phase.',
    },
    {
      item: 'BESCOM Electrical Service Connection',
      mandatory: true,
      ref: 'BESCOM Supply Code — Regulation 4.2',
      status: 'pending',
      tat_days: 21,
      description: 'Apply for temporary construction power (5kW) and permanent service connection (10kW for G+2). ₹12,000–20,000 deposit. Required before MEP phase.',
    },
    {
      item: 'KSPCB Consent for Construction Waste',
      mandatory: true,
      ref: 'C&D Waste Management Rules 2016 — KSPCB',
      status: 'pending',
      tat_days: 15,
      description: 'Register construction project with KSPCB for C&D waste management compliance. Debris disposal must go to authorized facility. ₹5,000 registration.',
    },
  ],
}


// ── What-If Baseline ──────────────────────────────────────────────────

export const DEMO_WHAT_IF_BASE = {
  original_p50_lakhs: 184.0,
  steel_price_pct: 0,
  labour_rate_pct: 0,
  timeline_weeks: 0,
  cement_price_pct: 0,
  // Pre-computed sensitivities (impact per 1% change)
  steel_sensitivity_per_pct: 0.272,     // ₹0.272L per 1% steel change
  labour_sensitivity_per_pct: 0.110,    // ₹0.110L per 1% labour change
  cement_sensitivity_per_pct: 0.095,    // ₹0.095L per 1% cement change
  time_sensitivity_per_week: 0.92,      // ₹0.92L per week extension
}

// Pre-computed What-If result for +15% steel scenario (used in demo step 4)
export const DEMO_WHAT_IF_STEEL_15 = {
  original_p50_lakhs: 184.0,
  new_p50_lakhs: 193.1,
  delta_lakhs: 9.1,
  delta_pct: 4.95,
  steel_impact_lakhs: 4.08,
  labour_impact_lakhs: 0,
  time_impact_lakhs: 0,
  cement_impact_lakhs: 0,
}


// ── Reverse Planning Options ──────────────────────────────────────────

export const DEMO_REVERSE_OPTIONS = {
  budget_lakhs: 180,
  deadline_months: 18,
  city: 'Bengaluru',
  ai_recommendation: 'For ₹1.8 Crore in Bengaluru, the Standard option (2BHK, 1,050 sqft) offers the best balance of space, quality, and timeline feasibility. Premium finishes push the area down to 820 sqft which may feel cramped for a family. Economy maximizes space but uses entry-level finishes. Recommendation: go Standard with selective premium upgrades (kitchen countertop, master bath fittings) within the contingency buffer.',
  options: [
    {
      grade: 'economy',
      label: 'Economy Build',
      feasible_sqft: 1280,
      estimated_cost_lakhs: 172.8,
      required_months: 16,
      timeline_feasible: true,
      what_gets_cut: ['Premium flooring → ceramic tiles', 'Modular kitchen → semi-modular', 'Teak doors → flush doors', 'No false ceiling', 'Basic sanitary fittings'],
      description: 'Maximum area at ₹1,350/sqft. Basic but functional finishes. Best for investment property or rental.',
      value_score: 7.2,
    },
    {
      grade: 'standard',
      label: 'Standard Build',
      feasible_sqft: 1050,
      estimated_cost_lakhs: 178.5,
      required_months: 17,
      timeline_feasible: true,
      what_gets_cut: ['Full-height tiling only in wet areas', 'Semi-premium sanitary fittings', 'Laminate flooring in bedrooms'],
      description: 'Balanced option at ₹1,700/sqft. Good liveability with standard finishes. Ideal for owner-occupied.',
      value_score: 8.5,
    },
    {
      grade: 'premium',
      label: 'Premium Build',
      feasible_sqft: 820,
      estimated_cost_lakhs: 180.4,
      required_months: 18,
      timeline_feasible: true,
      what_gets_cut: ['Smaller bedrooms (10×11)', 'Single balcony instead of two', 'Compact utility area'],
      description: 'Premium finishes at ₹2,200/sqft. Smaller area but high-end materials — vitrified tiles, Jaquar fittings, full modular kitchen.',
      value_score: 7.8,
    },
  ],
}


// ── Copilot Pre-seeded Response (for AAC Blocks question) ─────────────

export const DEMO_COPILOT_AAC_RESPONSE = {
  reply: `**Yes, AAC blocks are an excellent choice for your Sharma Residence project in Bengaluru.** Here's a detailed analysis:

### Cost Impact
- **Saves ₹2.1 Lakhs** compared to traditional clay bricks for your 3,484 sqft built-up area
- AAC blocks: ₹6,600/m³ vs Clay bricks: ₹7,500/1000 units
- Additional savings from reduced mortar consumption (thinner joints)

### Structural Compliance
- **IS 2185 (Part 1)** compliant — approved for load-bearing walls up to G+2
- Compressive strength: 3–4 N/mm² (adequate for your G+2 residential)
- Lighter weight reduces dead load on foundation by ~30%

### Bengaluru Availability
- **85% availability** in Bengaluru market (HIL, Ultratech AAC, Magicrete)
- 2–3 day delivery from Peenya and Nelamangala manufacturing units

### Thermal Performance
- Excellent thermal insulation (thermal score: 8/10 vs 3/10 for clay brick)
- Reduces AC load by 20–25% — significant for Bengaluru's warm months
- Sound insulation: STC rating 40+ dB

### Timeline Impact
- **Saves 1 week** on masonry phase due to larger block size (600×200×200mm)
- Fewer blocks to lay per sqm = faster construction

**Recommendation**: Switch to AAC blocks for all non-structural walls. Keep clay bricks for compound wall and parapet where moisture resistance matters.`,
  sources: ['IS 2185 Part 1', 'IS 456:2000', 'NBC 2016 Part 4', 'CPWD DSR 2023 Item 5.1.2'],
  ai_generated: true,
}


// ── Combined Demo Project Export ──────────────────────────────────────

export const DEMO_PROJECT_SEED = {
  project: DEMO_PROJECT_INPUT,
  floorPlan: DEMO_FLOOR_PLAN,
  costEstimate: DEMO_COST_ESTIMATE,
  schedule: DEMO_SCHEDULE,
  resources: DEMO_RESOURCES,
  risks: DEMO_RISKS,
  compliance: DEMO_COMPLIANCE,
  whatIfBase: DEMO_WHAT_IF_BASE,
  whatIfResult: DEMO_WHAT_IF_STEEL_15,
  reverseOptions: DEMO_REVERSE_OPTIONS,
  copilotAAC: DEMO_COPILOT_AAC_RESPONSE,
}

export default DEMO_PROJECT_SEED
