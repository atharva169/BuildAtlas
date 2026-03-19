import { create } from 'zustand';
import { api } from '../api/client';

export const useProjectStore = create((set, get) => ({
  // ── Input State ──
  projectInput: null,

  // ── Engine Results ──
  floorPlan: null,
  costEstimate: null,
  schedule: null,
  resources: null,
  riskRegister: null,
  compliance: null,

  // ── Interactive ──
  whatIfDeltas: null,
  reversePlan: null,
  cascadeResult: null,
  materialSwaps: null,

  // ── UI ──
  isAnalyzing: false,
  analysisError: null,

  // ── Actions ──
  setProjectInput: (input) => set({ projectInput: input }),

  analyzeProject: async (input) => {
    set({ isAnalyzing: true, analysisError: null, projectInput: input });
    try {
      const res = await api.post('/api/project/analyze', input);
      set({
        floorPlan: res.data.floorplan,
        costEstimate: res.data.cost,
        schedule: res.data.schedule,
        resources: res.data.resources,
        riskRegister: res.data.risk,
        compliance: res.data.compliance,
        isAnalyzing: false,
      });
      return true;
    } catch (err) {
      set({
        isAnalyzing: false,
        analysisError: err.response?.data?.detail || err.message,
      });
      return false;
    }
  },

  simulateWhatIf: async (params) => {
    const input = get().projectInput;
    if (!input) return;
    try {
      const res = await api.post('/api/whatif/simulate', { project: input, params });
      set({ whatIfDeltas: res.data });
    } catch (err) {
      console.error('What-if error:', err);
    }
  },

  predictCascade: async (delayedPhaseId, delayDays) => {
    const input = get().projectInput;
    if (!input) return;
    try {
      const res = await api.post('/api/cascade/predict', {
        project: input,
        delayed_phase_id: delayedPhaseId,
        delay_days: delayDays,
      });
      set({ cascadeResult: res.data });
    } catch (err) {
      console.error('Cascade error:', err);
    }
  },

  loadReversePlan: async () => {
    const input = get().projectInput;
    if (!input) return;
    try {
      const res = await api.post('/api/reverse/plan', input);
      set({ reversePlan: res.data });
    } catch (err) {
      console.error('Reverse plan error:', err);
    }
  },

  loadMaterialSwaps: async () => {
    const input = get().projectInput;
    if (!input) return;
    try {
      const res = await api.post('/api/materials/swap', input || {});
      set({ materialSwaps: res.data });
    } catch (err) {
      console.error('Material swap error:', err);
    }
  },

  resetProject: () => set({
    projectInput: null, floorPlan: null, costEstimate: null,
    schedule: null, resources: null, riskRegister: null,
    compliance: null, whatIfDeltas: null, reversePlan: null,
    cascadeResult: null, materialSwaps: null,
  }),

  // ── Derived ──
  hasAnalysis: () => {
    const s = get();
    return s.costEstimate !== null && s.schedule !== null;
  },

  getProjectContext: () => {
    const s = get();
    if (!s.projectInput) return null;
    return {
      project_name: s.projectInput.project_name,
      type: s.projectInput.building_type,
      config: s.projectInput.bhk_config,
      area_sqft: s.floorPlan?.total_built_area || 0,
      floors: s.projectInput.num_floors,
      city: s.projectInput.city,
      total_cost_p50: s.costEstimate?.total_p50 || 0,
      schedule_days: s.schedule?.total_duration_days || 0,
      critical_risks: s.riskRegister?.risks?.filter(r => r.severity === 'critical').map(r => r.title) || [],
    };
  },
}));
