"""Pydantic models for all engine inputs/outputs."""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Literal, Optional


# ── Project Input ──
class ProjectInput(BaseModel):
    project_name: str = "My Project"
    building_type: Literal["residential", "commercial", "industrial"] = "residential"
    bhk_config: str = "2BHK"
    plot_width_ft: float = 40.0
    plot_depth_ft: float = 60.0
    num_floors: int = 2
    city: str = "bengaluru"
    state: str = "karnataka"
    budget_inr: Optional[float] = None
    deadline_months: Optional[int] = None
    material_preferences: dict = Field(default_factory=dict)
    vastu_enabled: bool = False


# ── Floor Plan ──
class Room(BaseModel):
    id: str
    name: str
    x: float
    y: float
    width: float
    height: float
    area_sqft: float
    vastu_direction: Optional[str] = None

class FloorPlanResponse(BaseModel):
    rooms: list[Room]
    plot_width: float
    plot_depth: float
    total_built_area: float
    carpet_area: float
    walls: list[dict] = Field(default_factory=list)
    vastu_compliance: Optional[dict] = None


# ── Cost Estimation ──
class BOQLineItem(BaseModel):
    category: str
    item: str
    unit: str
    quantity: float
    base_rate: float
    city_rate: float
    p10_cost: float
    p50_cost: float
    p90_cost: float
    variance_driver: str

class CostResponse(BaseModel):
    boq: list[BOQLineItem]
    total_p10: float
    total_p50: float
    total_p90: float
    primary_variance_driver: str
    cost_by_category: dict[str, float]
    cost_per_sqft: float


# ── Schedule ──
class Phase(BaseModel):
    id: str
    name: str
    start_day: int
    end_day: int
    duration_days: int
    dependencies: list[str] = Field(default_factory=list)
    is_critical: bool = False
    monsoon_buffered: bool = False
    approval_dependency: Optional[str] = None

class ScheduleResponse(BaseModel):
    phases: list[Phase]
    total_duration_days: int
    critical_path: list[str]
    monsoon_lockout_days: int
    approval_wait_days: int


# ── Resource Allocation ──
class CrewAllocation(BaseModel):
    phase_id: str
    phase_name: str
    workers: dict[str, int]  # {"mason": 4, "helper": 8, ...}
    equipment: list[str]
    materials_needed: list[str]
    duration_days: int

class ResourceResponse(BaseModel):
    crew_plan: list[CrewAllocation]
    total_mandays: int
    peak_workers: int
    equipment_list: list[str]


# ── Risk Register ──
class RiskItem(BaseModel):
    id: str
    category: str
    title: str
    probability: float          # 0-1
    impact: float               # 0-10
    score: float                # probability × impact
    severity: Literal["low", "medium", "high", "critical"]
    default_narrative: str
    narrative: str = ""         # filled by AI

class RiskResponse(BaseModel):
    risks: list[RiskItem]
    overall_score: float
    top_risk: str
    narrative_context: dict = Field(default_factory=dict)


# ── What-If ──
class WhatIfParams(BaseModel):
    steel_price_delta_pct: float = 0
    labour_rate_delta_pct: float = 0
    timeline_compression_pct: float = 0
    monsoon_extension_weeks: int = 0
    cement_price_delta_pct: float = 0

class WhatIfResponse(BaseModel):
    original_cost: float
    new_cost: float
    cost_delta: float
    cost_delta_pct: float
    original_days: int
    new_days: int
    days_delta: int
    risk_delta: float
    breakdown: list[dict]


# ── Compliance ──
class ComplianceItem(BaseModel):
    regulation: str
    authority: str
    required: bool
    avg_tat_days: int
    required_docs: list[str]
    status: Literal["pending", "in_progress", "completed"] = "pending"

class ComplianceResponse(BaseModel):
    items: list[ComplianceItem]
    total_approval_days: int
    state_authority: str
    state_notes: str


# ── Reverse Planning ──
class BuildConfig(BaseModel):
    tier: Literal["economy", "standard", "premium"]
    estimated_cost: float
    area_sqft: float
    num_floors: int
    material_choices: dict
    timeline_months: int
    trade_offs: list[str]

class ReverseResponse(BaseModel):
    configs: list[BuildConfig]
    budget: float
    deadline_months: Optional[int]
    feasibility_notes: list[str]


# ── Delay Cascade ──
class CascadeEffect(BaseModel):
    phase_id: str
    phase_name: str
    original_end: int
    new_end: int
    delay_days: int
    is_critical: bool

class CascadeResponse(BaseModel):
    delayed_phase: str
    delay_days: int
    affected_phases: list[CascadeEffect]
    new_total_days: int
    original_total_days: int
    mitigations: list[dict] = Field(default_factory=list)


# ── Material Swap ──
class SwapResult(BaseModel):
    original: str
    replacement: str
    original_name: str
    replacement_name: str
    cost_delta_pct: float
    time_delta_pct: float
    weight_reduction_pct: float
    strength: str
    original_is_code: str
    replacement_is_code: str
    notes: str
    reasoning: str = ""

class MaterialSwapResponse(BaseModel):
    swaps: list[SwapResult]


# ── Full Analysis ──
class FullAnalysisResponse(BaseModel):
    floorplan: FloorPlanResponse
    cost: CostResponse
    schedule: ScheduleResponse
    resources: ResourceResponse
    risk: RiskResponse
    compliance: ComplianceResponse
