"""Schedule Engine — CPM-based with monsoon lockouts and approval TATs."""
import math
from datetime import date, timedelta
from backend.engines.base import BaseEngine
from backend.models.schemas import (
    ProjectInput, ScheduleResponse, Phase, CostResponse
)


# Phase templates with duration factors (days per 1000 sqft)
PHASE_TEMPLATES = [
    {
        "id": "approvals",
        "name": "Approvals & Permits",
        "days_per_1000sqft": 0,   # fixed duration from compliance TATs
        "base_days": 45,
        "dependencies": [],
        "outdoor": False,
        "approval": True,
    },
    {
        "id": "foundation",
        "name": "Foundation & Substructure",
        "days_per_1000sqft": 12,
        "base_days": 20,
        "dependencies": ["approvals"],
        "outdoor": True,
        "approval": False,
    },
    {
        "id": "structure",
        "name": "RCC Structure",
        "days_per_1000sqft": 18,
        "base_days": 30,
        "dependencies": ["foundation"],
        "outdoor": True,
        "approval": False,
    },
    {
        "id": "masonry",
        "name": "Masonry & Brickwork",
        "days_per_1000sqft": 10,
        "base_days": 15,
        "dependencies": ["structure"],
        "outdoor": False,
        "approval": False,
    },
    {
        "id": "mep",
        "name": "MEP (Electrical, Plumbing, HVAC)",
        "days_per_1000sqft": 8,
        "base_days": 20,
        "dependencies": ["masonry"],
        "outdoor": False,
        "approval": False,
    },
    {
        "id": "finishing",
        "name": "Finishing & Interiors",
        "days_per_1000sqft": 12,
        "base_days": 25,
        "dependencies": ["mep"],
        "outdoor": False,
        "approval": False,
    },
]


class ScheduleEngine(BaseEngine):
    """CPM schedule generator with monsoon lockout and approval buffers."""

    def compute(self, project_input: ProjectInput,
                cost: CostResponse = None, **kwargs) -> ScheduleResponse:
        state = project_input.state.lower()
        num_floors = project_input.num_floors
        area = project_input.plot_width_ft * project_input.plot_depth_ft * 0.7 * num_floors

        monsoon = self.data.get_monsoon_lockout(state)
        monsoon_start_month = monsoon["start_month"]
        monsoon_end_month = monsoon["end_month"]
        lockout_pct = monsoon["outdoor_lockout_pct"]

        # Build phases with durations
        phases = []
        current_day = 0
        monsoon_buffer_total = 0
        approval_wait_total = 0

        for tmpl in PHASE_TEMPLATES:
            # Calculate base duration
            if tmpl["approval"]:
                duration = tmpl["base_days"]
                approval_wait_total += duration
            else:
                duration = tmpl["base_days"] + int((area / 1000) * tmpl["days_per_1000sqft"])
                # Scale by floors for structural work
                if tmpl["id"] in ("structure",):
                    duration = int(duration * (1 + (num_floors - 1) * 0.4))

            # Apply monsoon buffer for outdoor phases
            monsoon_buffered = False
            if tmpl["outdoor"]:
                # Check if this phase would overlap with monsoon
                start_month = (date.today() + timedelta(days=current_day)).month
                phase_months = duration / 30
                end_month = start_month + phase_months
                
                if (start_month <= monsoon_end_month and
                    start_month + phase_months >= monsoon_start_month):
                    buffer = int(duration * lockout_pct * 0.5)
                    duration += buffer
                    monsoon_buffer_total += buffer
                    monsoon_buffered = True

            # Calculate start from dependencies
            start_day = current_day
            if tmpl["dependencies"]:
                for dep_id in tmpl["dependencies"]:
                    dep_phase = next((p for p in phases if p.id == dep_id), None)
                    if dep_phase:
                        start_day = max(start_day, dep_phase.end_day)

            phases.append(Phase(
                id=tmpl["id"],
                name=tmpl["name"],
                start_day=start_day,
                end_day=start_day + duration,
                duration_days=duration,
                dependencies=tmpl["dependencies"],
                is_critical=True,  # linear chain = all critical
                monsoon_buffered=monsoon_buffered,
                approval_dependency=tmpl["name"] if tmpl["approval"] else None,
            ))

            current_day = start_day + duration

        total_days = max(p.end_day for p in phases)

        return ScheduleResponse(
            phases=phases,
            total_duration_days=total_days,
            critical_path=[p.id for p in phases],
            monsoon_lockout_days=monsoon_buffer_total,
            approval_wait_days=approval_wait_total,
        )
