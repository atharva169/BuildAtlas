// FILE: src/services/api.js
// ═══════════════════════════════════════════════════════════════════════
// API Client with Offline Fallback
// Every call: try real API → on error, fall back to calculations.js
// Never show errors to user. Log to console only.
// ═══════════════════════════════════════════════════════════════════════

import {
  estimateCostFrontend,
  calculateWhatIfFrontend,
  generateScheduleFrontend,
  reversePlanFrontend,
  calculateCascadeFrontend,
  generateFloorPlanFrontend,
} from '../utils/calculations'

const BASE = import.meta.env.VITE_API_URL || ''
const TIMEOUT_MS = 8000 // 8 second timeout for demo

async function request(path, options = {}) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    })
    clearTimeout(timeout)

    const json = await res.json()
    if (!res.ok) return { success: false, data: null, error: json.error || json.detail || res.statusText }
    return json
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn(`[BuildAtlas] ⏱️ API timeout: ${path}`)
    } else {
      console.warn(`[BuildAtlas] ⚠️ API error: ${path}`, err.message)
    }
    return { success: false, data: null, error: err.message }
  }
}

const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
const get = (path) => request(path)

// ── Fallback-wrapped API calls ──────────────────────────────────────

function withFallback(apiFn, fallbackFn) {
  return async (...args) => {
    const res = await apiFn(...args)
    if (res.success !== false && res.data) return res
    // Attempt to compute locally
    if (fallbackFn) {
      try {
        const fallbackData = fallbackFn(...args)
        console.log('[BuildAtlas] 🔄 Using client-side fallback')
        return { success: true, data: fallbackData, _fallback: true }
      } catch (e) {
        console.warn('[BuildAtlas] ❌ Fallback also failed:', e.message)
      }
    }
    return res
  }
}

export const api = {
  health: () => get('/api/health'),

  createProject: (project) => post('/api/project', project),

  generateFloorPlan: withFallback(
    (project) => post('/api/floorplan', project),
    (project) => generateFloorPlanFrontend(project)
  ),

  calculateEstimate: withFallback(
    (project) => post('/api/estimate', project),
    (project) => estimateCostFrontend(project)
  ),

  generateSchedule: withFallback(
    (project) => post('/api/schedule', project),
    (project) => generateScheduleFrontend(project)
  ),

  generateResources: withFallback(
    (project) => post('/api/resources', project),
    null // Seed data handles this
  ),

  assessRisks: withFallback(
    (project) => post('/api/risks', project),
    null // Seed data handles this
  ),

  calculateWhatIf: withFallback(
    (project, params) => post(
      `/api/whatif?steel_price_pct=${params.steel_price_pct}&labour_rate_pct=${params.labour_rate_pct}&timeline_weeks=${params.timeline_weeks}&cement_price_pct=${params.cement_price_pct || 0}`,
      project
    ),
    (project, params) => calculateWhatIfFrontend(
      estimateCostFrontend(project).total.p50,
      params.steel_price_pct, params.labour_rate_pct,
      params.timeline_weeks, params.cement_price_pct
    )
  ),

  reversePlan: withFallback(
    (project) => post('/api/reverse', project),
    (project) => ({
      budget_lakhs: project.budget_lakhs,
      deadline_months: project.deadline_months,
      city: project.city,
      options: reversePlanFrontend(
        project.budget_lakhs, project.deadline_months,
        project.city, project.project_type
      ),
    })
  ),

  delayCascade: withFallback(
    (project, cascadeInput) => post(
      `/api/cascade?delayed_phase_index=${cascadeInput.delayed_phase_index}&delay_weeks=${cascadeInput.delay_weeks}`,
      project
    ),
    null // Needs existing schedule phases — computed in component
  ),

  getMaterials: (category) => get(`/api/materials/${category}`),

  swapMaterial: (category, origId, altId, project) =>
    post(`/api/materials/swap?category=${category}&original_id=${origId}&alternative_id=${altId}`, project),

  askCopilot: (message, projectContext) =>
    post('/api/copilot', { message, project_context: projectContext }),

  generateCompliance: withFallback(
    (project) => post('/api/compliance', project),
    null // Seed data handles this
  ),

  generateReport: (project) => post('/api/report', project),
}
