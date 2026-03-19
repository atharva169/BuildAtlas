"""
BuildAtlas GenAI — Pydantic Models
All request/response models for the FastAPI backend.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ── Enums ──────────────────────────────────────────────────────────────────

class ProjectType(str, Enum):
    """Building use-case type."""
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"


class QualityTier(str, Enum):
    """Construction quality level."""
    ECONOMY = "economy"
    STANDARD = "standard"
    PREMIUM = "premium"
    LUXURY = "luxury"


class SoilType(str, Enum):
    """Sub-soil classification."""
    SOFT = "soft"
    MEDIUM = "medium"
    HARD_ROCK = "hard_rock"


class BHKType(str, Enum):
    """Residential unit configuration."""
    ONE_BHK = "1BHK"
    TWO_BHK = "2BHK"
    THREE_BHK = "3BHK"


# ── Core Request Model ────────────────────────────────────────────────────

class ProjectInput(BaseModel):
    """Primary input for all engine computations."""
    project_name: str = Field(..., min_length=1, max_length=120, description="Human-readable project name")
    city: str = Field(..., description="City name (must match CITY_RATES key)")
    project_type: ProjectType = Field(ProjectType.RESIDENTIAL, description="Building use-case type")
    floors: int = Field(2, ge=1, le=15, description="Number of storeys including ground floor (G+N)")
    plot_length_ft: float = Field(..., gt=10, le=500, description="Plot length in feet")
    plot_width_ft: float = Field(..., gt=10, le=500, description="Plot width in feet")
    builtup_sqft: float = Field(..., gt=0, le=100000, description="Total built-up area in sqft")
    quality: QualityTier = Field(QualityTier.STANDARD, description="Finish quality tier")
    vastu: bool = Field(False, description="Apply Vastu Shastra placement rules")
    start_month: int = Field(..., ge=1, le=12, description="Construction start month (1=Jan)")
    start_year: int = Field(2025, ge=2024, le=2035, description="Construction start year")
    soil_type: SoilType = Field(SoilType.MEDIUM, description="Sub-soil classification")
    bhk_type: BHKType = Field(BHKType.THREE_BHK, description="Residential unit configuration")
    budget_lakhs: Optional[float] = Field(None, gt=0, description="Budget cap for reverse planning (₹ lakhs)")
    deadline_months: Optional[int] = Field(None, gt=0, le=60, description="Deadline for reverse planning (months)")

    @field_validator("builtup_sqft")
    @classmethod
    def builtup_must_fit_plot(cls, v: float, info) -> float:
        """Built-up area cannot be ridiculously larger than plot."""
        data = info.data
        plot_area = data.get("plot_length_ft", 100) * data.get("plot_width_ft", 100)
        max_floors = data.get("floors", 2)
        if v > plot_area * max_floors * 1.2:
            raise ValueError(f"Built-up {v} sqft exceeds plausible limit for plot×floors")
        return v

    @property
    def plot_area_sqft(self) -> float:
        """Convenience: total plot area."""
        return self.plot_length_ft * self.plot_width_ft


# ── Cost Models ────────────────────────────────────────────────────────────

class CostBand(BaseModel):
    """Confidence band triplet."""
    p10: float = Field(..., description="Optimistic estimate (₹ lakhs)")
    p50: float = Field(..., description="Most-likely estimate (₹ lakhs)")
    p90: float = Field(..., description="Pessimistic estimate (₹ lakhs)")


class BOQItem(BaseModel):
    """Single line item in Bill of Quantities."""
    sno: int
    category: str = Field(..., description="Component category name")
    percentage: float = Field(..., description="Share of total cost (%)")
    amount_lakhs: float = Field(..., description="Amount in ₹ lakhs")


class CostEstimate(BaseModel):
    """Full cost estimation response."""
    total: CostBand
    cost_per_sqft: CostBand
    boq: list[BOQItem]
    city: str
    city_rate_used: float
    quality_multiplier: float
    structural_multiplier: float
    variance_driver: str = Field(..., description="Primary factor driving P10–P90 spread")


# ── What-If Models ─────────────────────────────────────────────────────────

class WhatIfParams(BaseModel):
    """Slider values for what-if scenario analysis."""
    steel_price_pct: float = Field(0.0, ge=-30, le=50, description="Steel price change %")
    labour_rate_pct: float = Field(0.0, ge=-20, le=40, description="Labour rate change %")
    timeline_weeks: float = Field(0.0, ge=-8, le=24, description="Timeline shift in weeks")
    cement_price_pct: float = Field(0.0, ge=-20, le=40, description="Cement price change %")


class WhatIfResult(BaseModel):
    """Delta output for what-if analysis."""
    original_p50_lakhs: float
    new_p50_lakhs: float
    delta_lakhs: float
    delta_pct: float
    steel_impact_lakhs: float
    labour_impact_lakhs: float
    time_impact_lakhs: float
    cement_impact_lakhs: float


# ── Floor Plan Models ──────────────────────────────────────────────────────

class RoomRect(BaseModel):
    """A single room rectangle in the floor plan."""
    room_type: str
    label: str
    x: float = Field(..., description="Left edge X in feet from plot origin")
    y: float = Field(..., description="Top edge Y in feet from plot origin")
    width: float = Field(..., description="Room width in feet")
    height: float = Field(..., description="Room height (depth) in feet")
    area_sqft: float
    zone: str = Field(..., description="Functional zone: social / private / service")
    vastu_direction: Optional[str] = Field(None, description="Vastu compass direction if applied")


class FloorPlanOutput(BaseModel):
    """Complete floor plan layout."""
    plot_length_ft: float
    plot_width_ft: float
    usable_length: float
    usable_width: float
    carpet_area_sqft: float
    rooms: list[RoomRect]
    vastu_applied: bool
    warnings: list[str] = Field(default_factory=list)


# ── Schedule Models ────────────────────────────────────────────────────────

class PhaseItem(BaseModel):
    """One construction phase in the Gantt chart."""
    index: int
    name: str
    base_weeks: int
    adjusted_weeks: int = Field(..., description="Duration after monsoon/floor adjustments")
    start_date: str = Field(..., description="ISO date string")
    end_date: str = Field(..., description="ISO date string")
    depends_on: list[int] = Field(default_factory=list)
    is_outdoor: bool
    is_critical: bool
    monsoon_delay_weeks: int = 0
    status: str = Field("FREE", description="FREE | BLOCKED | PARTIAL")


class ScheduleOutput(BaseModel):
    """Full project schedule response."""
    project_start: str
    project_end: str
    total_weeks: int
    total_months: float
    phases: list[PhaseItem]
    critical_path_indices: list[int]
    monsoon_lockout_weeks: int
    approval_wait_weeks: int


# ── Delay Cascade Models ──────────────────────────────────────────────────

class DelayCascadeInput(BaseModel):
    """Input for delay cascade simulation."""
    delayed_phase_index: int = Field(..., ge=0, description="Index of the phase being delayed")
    delay_weeks: int = Field(..., ge=1, le=52, description="Number of weeks of delay")


class CascadePhaseResult(BaseModel):
    """One phase's cascade result."""
    index: int
    name: str
    original_end: str
    new_end: str
    delay_days: int
    status: str = Field(..., description="BLOCKED | PARTIAL | FREE")


class DelayCascadeResult(BaseModel):
    """Full cascade simulation output."""
    trigger_phase: str
    delay_weeks: int
    affected_phases: list[CascadePhaseResult]
    original_project_end: str
    new_project_end: str
    total_delay_days: int
    cost_impact_lakhs: float


# ── Risk Models ────────────────────────────────────────────────────────────

class RiskItem(BaseModel):
    """Single scored risk."""
    risk_id: str
    category: str
    title: str
    score: float = Field(..., ge=0, le=10, description="Risk score (probability × impact on 1–10)")
    weight: float = Field(..., description="Category weight in overall score")
    severity: str = Field(..., description="critical | medium | low")
    mitigation: str
    ai_narrative: Optional[str] = Field(None, description="LLM-generated narrative (if available)")


class RiskRegister(BaseModel):
    """Full risk assessment output."""
    risks: list[RiskItem]
    overall_score: float = Field(..., ge=0, le=10)
    top_risks: list[str] = Field(..., description="risk_ids of critical items")


# ── Reverse Planning Models ───────────────────────────────────────────────

class BuildConfig(BaseModel):
    """One feasible build option from reverse planning."""
    grade: str
    label: str
    feasible_sqft: float
    estimated_cost_lakhs: float
    required_months: float
    timeline_feasible: bool
    what_gets_cut: list[str]
    description: str
    value_score: float = Field(..., description="Composite value score for ranking")


class ReversePlanResult(BaseModel):
    """Reverse planning output — always 3 options."""
    budget_lakhs: float
    deadline_months: int
    city: str
    options: list[BuildConfig]
    ai_recommendation: Optional[str] = Field(None, description="LLM-generated recommendation")


# ── Material Swap Models ──────────────────────────────────────────────────

class MaterialInfo(BaseModel):
    """Single material option."""
    id: str
    name: str
    is_code: str
    unit: str
    base_cost: float
    time_delta_weeks: float
    strength_pct: float
    thermal_score: float
    availability_pct: float
    is_baseline: bool


class MaterialSwapResult(BaseModel):
    """Material swap analysis output."""
    original: MaterialInfo
    alternative: MaterialInfo
    cost_delta_pct: float
    time_delta_weeks: float
    strength_delta_pct: float
    thermal_improvement: float
    ai_recommendation: Optional[str] = Field(None)


# ── Resource Models ────────────────────────────────────────────────────────

class ResourceItem(BaseModel):
    """Crew and equipment for one phase."""
    phase_name: str
    crew: dict[str, int] = Field(..., description="Role → head-count mapping")
    equipment: list[str]
    daily_labour_cost: float = Field(..., description="Total daily labour cost in ₹")


class ResourcePlan(BaseModel):
    """Full resource allocation plan."""
    resources: list[ResourceItem]
    total_labour_days: int
    peak_workforce: int
    total_labour_cost_lakhs: float


# ── Copilot Models ─────────────────────────────────────────────────────────

class CopilotRequest(BaseModel):
    """AI Copilot chat request."""
    message: str = Field(..., min_length=1, max_length=2000, description="User question")
    project_context: Optional[dict] = Field(None, description="Active project data for context")


class CopilotResponse(BaseModel):
    """AI Copilot chat response."""
    reply: str
    sources: list[str] = Field(default_factory=list, description="IS code / CPWD references cited")
    ai_generated: bool = True


# ── Compliance Models ──────────────────────────────────────────────────────

class ChecklistItem(BaseModel):
    """Single compliance checklist entry."""
    item: str
    mandatory: bool
    ref: str = Field(..., description="Regulation / IS code reference")
    status: str = Field("pending", description="pending | done")


class ComplianceChecklist(BaseModel):
    """Auto-generated regulatory checklist."""
    city: str
    applicable_bodies: list[str]
    items: list[ChecklistItem]
    total_items: int
    mandatory_count: int


# ── Generic API Response Wrapper ──────────────────────────────────────────

class APIResponse(BaseModel):
    """Consistent JSON envelope for all endpoints."""
    success: bool = True
    data: Optional[dict] = None
    error: Optional[str] = None
