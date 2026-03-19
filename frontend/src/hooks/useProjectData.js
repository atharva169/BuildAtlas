// FILE: src/hooks/useProjectData.js
// ═══════════════════════════════════════════════════════════════════════
// Offline-First Data Hook
// Loads demo seed data immediately, then attempts API refresh in background.
// If API fails, seed data stays — the user never sees an error during demo.
// ═══════════════════════════════════════════════════════════════════════

import { useEffect, useState, useRef } from 'react'
import useProjectStore from '../store/projectStore'
import { api } from '../services/api'
import {
  DEMO_PROJECT_INPUT,
  DEMO_FLOOR_PLAN,
  DEMO_COST_ESTIMATE,
  DEMO_SCHEDULE,
  DEMO_RESOURCES,
  DEMO_RISKS,
  DEMO_COMPLIANCE,
  DEMO_WHAT_IF_STEEL_15,
  DEMO_REVERSE_OPTIONS,
} from '../data/demoProject'

/**
 * useProjectData — Offline-first project data loader
 *
 * 1. On mount: seed data is already in Zustand store (via initial state)
 * 2. If VITE_DEMO_MODE !== 'true': fire API calls in background
 * 3. On API success: update store with fresh data
 * 4. On API failure: keep seed data, log error, never show error to user
 *
 * @returns {{ loaded: boolean, fromAPI: boolean, apiStatus: string }}
 */
export function useProjectData() {
  const [status, setStatus] = useState({
    loaded: true,           // seed data is already in store
    fromAPI: false,
    apiStatus: 'idle',      // 'idle' | 'fetching' | 'success' | 'failed'
  })

  const hasAttempted = useRef(false)

  const store = useProjectStore()

  useEffect(() => {
    // Prevent double-fire in React StrictMode
    if (hasAttempted.current) return
    hasAttempted.current = true

    // In demo mode, skip API calls entirely — run 100% from seed data
    const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
    if (isDemoMode) {
      console.log('[BuildAtlas] 🎯 Demo mode active — running from seed data')
      return
    }

    // Attempt background API refresh
    refreshFromAPI()
  }, [])

  async function refreshFromAPI() {
    setStatus(s => ({ ...s, apiStatus: 'fetching' }))
    console.log('[BuildAtlas] 🔄 Attempting background API refresh...')

    const project = DEMO_PROJECT_INPUT

    try {
      // Fire all API calls concurrently — don't block on any single one
      const results = await Promise.allSettled([
        api.generateFloorPlan(project),
        api.calculateEstimate(project),
        api.generateSchedule(project),
        api.generateResources(project),
        api.assessRisks(project),
        api.generateCompliance(project),
      ])

      const [fpRes, ceRes, schRes, resRes, riskRes, compRes] = results

      let anySuccess = false

      // Update store only for successful responses
      if (fpRes.status === 'fulfilled' && fpRes.value?.success !== false && fpRes.value?.data) {
        store.setFloorPlan(fpRes.value.data)
        anySuccess = true
      }
      if (ceRes.status === 'fulfilled' && ceRes.value?.success !== false && ceRes.value?.data) {
        store.setCostEstimate(ceRes.value.data)
        anySuccess = true
      }
      if (schRes.status === 'fulfilled' && schRes.value?.success !== false && schRes.value?.data) {
        store.setSchedule(schRes.value.data)
        anySuccess = true
      }
      if (resRes.status === 'fulfilled' && resRes.value?.success !== false && resRes.value?.data) {
        store.setResources(resRes.value.data)
        anySuccess = true
      }
      if (riskRes.status === 'fulfilled' && riskRes.value?.success !== false && riskRes.value?.data) {
        store.setRisks(riskRes.value.data)
        anySuccess = true
      }
      if (compRes.status === 'fulfilled' && compRes.value?.success !== false && compRes.value?.data) {
        store.setCompliance(compRes.value.data)
        anySuccess = true
      }

      if (anySuccess) {
        store.setDataSource('api')
        console.log('[BuildAtlas] ✅ API data loaded successfully')
      }

      setStatus({
        loaded: true,
        fromAPI: anySuccess,
        apiStatus: anySuccess ? 'success' : 'failed',
      })

      // Log individual failures (silently — never show to user)
      results.forEach((r, i) => {
        const names = ['floorPlan', 'costEstimate', 'schedule', 'resources', 'risks', 'compliance']
        if (r.status === 'rejected') {
          console.warn(`[BuildAtlas] ⚠️ API ${names[i]} failed:`, r.reason?.message || r.reason)
        } else if (r.value?.success === false) {
          console.warn(`[BuildAtlas] ⚠️ API ${names[i]} returned error:`, r.value?.error)
        }
      })

    } catch (err) {
      // Total failure — keep seed data, log and move on
      console.warn('[BuildAtlas] ⚠️ API refresh failed entirely — using seed data:', err.message)
      setStatus({
        loaded: true,
        fromAPI: false,
        apiStatus: 'failed',
      })
    }
  }

  return status
}

export default useProjectData
