// FILE: src/utils/calculations.js
// Client-side calculation mirrors of backend engines — ensures demo never breaks.

import { CITY_RATES, BOQ_COMPONENTS, PHASE_TEMPLATES, MONSOON_MONTHS } from './constants'

// ── Cost Engine ───────────────────────────────────────────────────────
const QUALITY_MULTS = { economy: 0.82, standard: 1.0, premium: 1.28, luxury: 1.65 }

export function estimateCostFrontend(project) {
  const rates = CITY_RATES[project.city] || CITY_RATES['Tier-2'] || { residential: 1450, commercial: 1900 }
  const baseRate = rates[project.project_type] || rates.residential
  const qualityMult = QUALITY_MULTS[project.quality] || 1.0
  const structuralMult = 1.0 + Math.max(0, (project.floors || 2) - 1) * 0.15
  const p50 = (project.builtup_sqft * baseRate * qualityMult * structuralMult) / 100000
  const p10 = p50 * 0.845
  const p90 = p50 * 1.256

  const boq = Object.entries(BOQ_COMPONENTS).map(([category, pct], i) => ({
    sno: i + 1, category, percentage: +(pct * 100).toFixed(1), amount_lakhs: +(p50 * pct).toFixed(2),
  }))

  return {
    total: { p10: +p10.toFixed(2), p50: +p50.toFixed(2), p90: +p90.toFixed(2) },
    cost_per_sqft: {
      p10: Math.round(p10 * 100000 / project.builtup_sqft),
      p50: Math.round(p50 * 100000 / project.builtup_sqft),
      p90: Math.round(p90 * 100000 / project.builtup_sqft),
    },
    boq, city: project.city, city_rate_used: baseRate,
    quality_multiplier: qualityMult, structural_multiplier: structuralMult,
    variance_driver: 'Steel price volatility (Fe-500D TMT) drives ±18% P10-P90 spread',
  }
}

// ── What-If Engine ────────────────────────────────────────────────────
export function calculateWhatIfFrontend(p50, steelPct = 0, labourPct = 0, weeks = 0, cementPct = 0) {
  const steelImpact = p50 * 0.42 * 0.38 * (steelPct / 100)
  const labourImpact = p50 * 0.10 * (labourPct / 100)
  const timeImpact = weeks * 0.35
  const cementImpact = p50 * 0.42 * 0.25 * (cementPct / 100)
  const delta = steelImpact + labourImpact + timeImpact + cementImpact
  return {
    original_p50_lakhs: +p50.toFixed(2), new_p50_lakhs: +(p50 + delta).toFixed(2),
    delta_lakhs: +delta.toFixed(2), delta_pct: p50 > 0 ? +((delta / p50) * 100).toFixed(2) : 0,
    steel_impact_lakhs: +steelImpact.toFixed(2), labour_impact_lakhs: +labourImpact.toFixed(2),
    time_impact_lakhs: +timeImpact.toFixed(2), cement_impact_lakhs: +cementImpact.toFixed(2),
  }
}

// ── Schedule Engine ───────────────────────────────────────────────────
export function generateScheduleFrontend(project) {
  const floorFactor = 1.0 + Math.max(0, (project.floors || 2) - 2) * 0.18
  const startDate = new Date(project.start_year, project.start_month - 1, 1)
  const monsoon = MONSOON_MONTHS[project.city] || []

  const phases = PHASE_TEMPLATES.map((tpl, i) => {
    let adj = tpl.base_weeks
    if (tpl.name.includes('Superstructure') || tpl.name.includes('Masonry')) {
      adj = Math.ceil(tpl.base_weeks * floorFactor)
    }
    // Simple monsoon buffer for outdoor phases
    if (tpl.outdoor && monsoon.length > 0) {
      const overlapWeeks = Math.min(adj, Math.round(monsoon.length * 1.2))
      const buffer = Math.ceil(overlapWeeks * 0.3)
      return { ...tpl, index: i, adjusted_weeks: adj + buffer, monsoon_delay_weeks: buffer }
    }
    return { ...tpl, index: i, adjusted_weeks: adj, monsoon_delay_weeks: 0 }
  })

  // Forward-pass
  let cursor = new Date(startDate)
  cursor.setDate(cursor.getDate() + 75) // ~11 weeks approval wait
  const approvalWeeks = 11

  for (const p of phases) {
    if (p.depends_on.length === 0) {
      p.start_date = cursor.toISOString().split('T')[0]
    } else {
      const latest = p.depends_on.reduce((max, dep) => {
        const depEnd = new Date(phases[dep].end_date)
        return depEnd > max ? depEnd : max
      }, new Date(0))
      p.start_date = latest.toISOString().split('T')[0]
    }
    const s = new Date(p.start_date)
    const e = new Date(s)
    e.setDate(e.getDate() + p.adjusted_weeks * 7)
    p.end_date = e.toISOString().split('T')[0]
  }

  // Critical path (simplified: longest chain)
  const critical = [0, 1, 2, 4]
  phases.forEach((p, i) => { p.is_critical = critical.includes(i) })

  const totalWeeks = phases.reduce((s, p) => s + p.adjusted_weeks, 0)
  const projectEnd = phases.reduce((max, p) => {
    const e = p.end_date
    return e > max ? e : max
  }, '')

  return {
    project_start: startDate.toISOString().split('T')[0],
    project_end: projectEnd, total_weeks: totalWeeks,
    total_months: +(totalWeeks / 4.33).toFixed(1),
    phases: phases.map(p => ({
      index: p.index, name: p.name, base_weeks: p.base_weeks,
      adjusted_weeks: p.adjusted_weeks, start_date: p.start_date, end_date: p.end_date,
      depends_on: p.depends_on, is_outdoor: p.outdoor, is_critical: p.is_critical,
      monsoon_delay_weeks: p.monsoon_delay_weeks, status: 'FREE',
    })),
    critical_path_indices: critical,
    monsoon_lockout_weeks: phases.reduce((s, p) => s + p.monsoon_delay_weeks, 0),
    approval_wait_weeks: approvalWeeks,
  }
}

// ── Delay Cascade ─────────────────────────────────────────────────────
export function calculateCascadeFrontend(phases, delayedIdx, delayWeeks) {
  const delayDays = delayWeeks * 7
  const results = phases.map(p => ({
    index: p.index, name: p.name,
    original_end: p.end_date, new_end: p.end_date,
    delay_days: 0, status: 'FREE',
  }))

  // Shift trigger
  const trigEnd = new Date(phases[delayedIdx].end_date)
  trigEnd.setDate(trigEnd.getDate() + delayDays)
  results[delayedIdx].new_end = trigEnd.toISOString().split('T')[0]
  results[delayedIdx].delay_days = delayDays
  results[delayedIdx].status = 'BLOCKED'

  // BFS
  for (let i = delayedIdx + 1; i < phases.length; i++) {
    const phase = phases[i]
    if (phase.depends_on.includes(delayedIdx) || phase.depends_on.some(d => results[d].delay_days > 0)) {
      const predEnds = phase.depends_on.map(d => new Date(results[d].new_end))
      const newStart = new Date(Math.max(...predEnds))
      const origStart = new Date(phase.start_date)
      const shift = Math.max(0, Math.round((newStart - origStart) / (1000 * 60 * 60 * 24)))
      if (shift > 0) {
        const dur = Math.round((new Date(phase.end_date) - origStart) / (1000 * 60 * 60 * 24))
        const ne = new Date(newStart)
        ne.setDate(ne.getDate() + dur)
        results[i].new_end = ne.toISOString().split('T')[0]
        results[i].delay_days = shift
        results[i].status = phase.depends_on.includes(delayedIdx) ? 'BLOCKED' : 'PARTIAL'
      }
    }
  }

  const origEnd = phases.reduce((m, p) => p.end_date > m ? p.end_date : m, '')
  const newEnd = results.reduce((m, r) => r.new_end > m ? r.new_end : m, '')
  const totalDelay = Math.max(0, Math.round((new Date(newEnd) - new Date(origEnd)) / (1000 * 60 * 60 * 24)))

  return {
    trigger_phase: phases[delayedIdx].name, delay_weeks: delayWeeks,
    affected_phases: results, original_project_end: origEnd,
    new_project_end: newEnd, total_delay_days: totalDelay,
    cost_impact_lakhs: +(totalDelay * 0.05).toFixed(2),
  }
}

// ── Reverse Planning ──────────────────────────────────────────────────
export function reversePlanFrontend(budget, deadline, city, projectType = 'residential') {
  const rates = CITY_RATES[city] || CITY_RATES['Tier-2'] || { residential: 1450 }
  const baseRate = rates[projectType] || rates.residential
  const grades = [
    { key: 'economy', label: 'Economy', mult: 0.82, timeMult: 1.0, cuts: ['No RCC frame', 'Basic tiles', 'No modular kitchen', 'Standard sanitary'] },
    { key: 'standard', label: 'Standard', mult: 1.0, timeMult: 1.15, cuts: ['Standard UPVC windows', 'Semi-modular kitchen'] },
    { key: 'premium', label: 'Premium', mult: 1.28, timeMult: 1.35, cuts: ['Premium adds 3-4 weeks', 'Metro labour premium 8-12%'] },
  ]
  return grades.map(g => {
    const effectiveRate = baseRate * g.mult
    const sqft = Math.round((budget * 100000) / effectiveRate)
    const baseMonths = 10 + sqft / 3000
    const months = +(baseMonths * g.timeMult).toFixed(1)
    return {
      grade: g.key, label: g.label, feasible_sqft: sqft,
      estimated_cost_lakhs: budget, required_months: months,
      timeline_feasible: months <= deadline, what_gets_cut: g.cuts,
      description: `${g.label} grade construction`, value_score: +(sqft / budget * (months <= deadline ? 1.2 : 0.7)).toFixed(2),
    }
  }).sort((a, b) => b.value_score - a.value_score)
}


// ── Floor Plan Engine ─────────────────────────────────────────────────
// Generates a basic Vastu-compliant room layout from plot dimensions

export function generateFloorPlanFrontend(project) {
  const plotL = project.plot_length_ft || 40
  const plotW = project.plot_width_ft || 30
  const setback = 2
  const usableL = plotL - setback * 2
  const usableW = plotW - setback * 2
  const vastu = project.vastu !== false

  // Split the usable area into zones
  const midX = usableL * 0.45
  const midY = usableW * 0.55

  const rooms = [
    {
      room_type: 'hall', label: 'Living / Drawing Room',
      x: setback, y: setback, width: midX, height: midY,
      area_sqft: +(midX * midY).toFixed(0), zone: 'social',
      vastu_direction: vastu ? 'North-East' : null,
    },
    {
      room_type: 'kitchen', label: 'Kitchen',
      x: setback + midX + 1, y: setback, width: usableL - midX - 1, height: midY * 0.55,
      area_sqft: +((usableL - midX - 1) * midY * 0.55).toFixed(0), zone: 'service',
      vastu_direction: vastu ? 'South-East' : null,
    },
    {
      room_type: 'dining', label: 'Dining Area',
      x: setback + midX + 1, y: setback + midY * 0.55 + 1, width: usableL - midX - 1, height: midY * 0.45 - 1,
      area_sqft: +((usableL - midX - 1) * (midY * 0.45 - 1)).toFixed(0), zone: 'social',
      vastu_direction: vastu ? 'West' : null,
    },
    {
      room_type: 'master_bed', label: 'Master Bedroom',
      x: setback, y: setback + midY + 1, width: midX * 0.65, height: usableW - midY - 1,
      area_sqft: +(midX * 0.65 * (usableW - midY - 1)).toFixed(0), zone: 'private',
      vastu_direction: vastu ? 'South-West' : null,
    },
    {
      room_type: 'bath1', label: 'Master Bath',
      x: setback + midX * 0.65 + 0.5, y: setback + midY + 1, width: midX * 0.35 - 0.5, height: (usableW - midY - 1) * 0.45,
      area_sqft: +((midX * 0.35 - 0.5) * (usableW - midY - 1) * 0.45).toFixed(0), zone: 'service',
      vastu_direction: vastu ? 'West' : null,
    },
  ]

  // Add bedrooms based on BHK type
  const bhkNum = parseInt(project.bhk_type) || 2
  if (bhkNum >= 2) {
    rooms.push({
      room_type: 'bed2', label: 'Bedroom 2',
      x: setback + midX + 1, y: setback + midY + 1, width: usableL - midX - 1, height: usableW - midY - 1,
      area_sqft: +((usableL - midX - 1) * (usableW - midY - 1)).toFixed(0), zone: 'private',
      vastu_direction: vastu ? 'North-West' : null,
    })
  }
  if (bhkNum >= 3) {
    // Split master bedroom area for 3rd room
    rooms[3].width = midX * 0.35
    rooms[3].area_sqft = +(midX * 0.35 * (usableW - midY - 1)).toFixed(0)
    rooms.push({
      room_type: 'bed3', label: 'Bedroom 3',
      x: setback + midX * 0.35 + 0.5, y: setback + midY + 1 + (usableW - midY - 1) * 0.45 + 0.5,
      width: midX * 0.65 - 0.5, height: (usableW - midY - 1) * 0.55 - 0.5,
      area_sqft: +((midX * 0.65 - 0.5) * ((usableW - midY - 1) * 0.55 - 0.5)).toFixed(0), zone: 'private',
      vastu_direction: vastu ? 'South' : null,
    })
  }

  // Add common bathroom
  rooms.push({
    room_type: 'bath2', label: 'Common Bath',
    x: setback + midX * 0.65 + 0.5, y: setback + midY + 1 + (usableW - midY - 1) * 0.45 + 0.5,
    width: midX * 0.35 - 0.5, height: (usableW - midY - 1) * 0.55 - 0.5,
    area_sqft: +((midX * 0.35 - 0.5) * ((usableW - midY - 1) * 0.55 - 0.5)).toFixed(0), zone: 'service',
    vastu_direction: vastu ? 'North-West' : null,
  })

  const carpetArea = rooms.reduce((s, r) => s + r.area_sqft, 0)

  return {
    plot_length_ft: plotL,
    plot_width_ft: plotW,
    usable_length: usableL,
    usable_width: usableW,
    carpet_area_sqft: carpetArea,
    vastu_applied: vastu,
    warnings: [],
    rooms,
  }
}
