// FILE: src/store/projectStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_PROJECT } from '../utils/constants'
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

// Use the Sharma Residence seed data as initial project
const SEED_PROJECT = { ...DEMO_PROJECT, ...DEMO_PROJECT_INPUT }

const useProjectStore = create(
  persist(
    (set, get) => ({
      // ── State (hydrated from seed data for instant demo) ───
      currentProject: SEED_PROJECT,
      floorPlan: DEMO_FLOOR_PLAN,
      costEstimate: DEMO_COST_ESTIMATE,
      schedule: DEMO_SCHEDULE,
      resources: DEMO_RESOURCES,
      risks: DEMO_RISKS,
      whatIfResult: DEMO_WHAT_IF_STEEL_15,
      reversePlan: DEMO_REVERSE_OPTIONS,
      compliance: DEMO_COMPLIANCE,
      activePage: 'dashboard',
      dataSource: 'seed',               // 'seed' | 'api'
      copilotMessages: [
        { role: 'ai', text: 'Welcome to BuildAtlas AI Copilot! I can help you with IS codes, cost estimates, scheduling questions, and construction best practices. What would you like to know?' }
      ],
      isLoading: {
        floorPlan: false, cost: false, schedule: false,
        resources: false, risks: false, whatIf: false,
        reverse: false, copilot: false, materials: false,
      },

      // ── Actions ────────────────────────────────────────────
      setProject: (project) => set({ currentProject: { ...get().currentProject, ...project } }),
      setFloorPlan: (fp) => set({ floorPlan: fp }),
      setCostEstimate: (ce) => set({ costEstimate: ce }),
      setSchedule: (s) => set({ schedule: s }),
      setResources: (r) => set({ resources: r }),
      setRisks: (r) => set({ risks: r }),
      setWhatIfResult: (w) => set({ whatIfResult: w }),
      setReversePlan: (rp) => set({ reversePlan: rp }),
      setCompliance: (c) => set({ compliance: c }),
      setActivePage: (page) => set({ activePage: page }),
      setDataSource: (src) => set({ dataSource: src }),
      addCopilotMessage: (msg) => set({ copilotMessages: [...get().copilotMessages, msg] }),
      setLoading: (key, val) => set({ isLoading: { ...get().isLoading, [key]: val } }),

      resetProject: () => set({
        currentProject: SEED_PROJECT,
        floorPlan: DEMO_FLOOR_PLAN,
        costEstimate: DEMO_COST_ESTIMATE,
        schedule: DEMO_SCHEDULE,
        resources: DEMO_RESOURCES,
        risks: DEMO_RISKS,
        whatIfResult: DEMO_WHAT_IF_STEEL_15,
        reversePlan: DEMO_REVERSE_OPTIONS,
        compliance: DEMO_COMPLIANCE,
        dataSource: 'seed',
      }),
    }),
    {
      name: 'buildatlas-store',
      version: 3,
      // When upgrading from old version, reset all slices to seed data
      migrate: (persistedState, version) => {
        if (version < 3) {
          return {
            ...persistedState,
            currentProject: SEED_PROJECT,
            floorPlan: DEMO_FLOOR_PLAN,
            costEstimate: DEMO_COST_ESTIMATE,
            schedule: DEMO_SCHEDULE,
            resources: DEMO_RESOURCES,
            risks: DEMO_RISKS,
            whatIfResult: DEMO_WHAT_IF_STEEL_15,
            reversePlan: DEMO_REVERSE_OPTIONS,
            compliance: DEMO_COMPLIANCE,
            dataSource: 'seed',
          }
        }
        return persistedState
      },
    }
  )
)

export default useProjectStore
