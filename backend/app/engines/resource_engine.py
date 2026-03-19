"""
BuildAtlas GenAI — Resource Allocation Engine
Crew sizing, equipment planning, and labour cost estimation per phase.
"""

from __future__ import annotations

from app.data.mock_data import CITY_TO_STATE, CREW_TEMPLATES, LABOUR_RATES
from app.models import ProjectInput, ResourceItem, ResourcePlan


class ResourceEngine:
    """Stateless resource allocation engine."""

    def plan(self, project: ProjectInput, phase_weeks: list[dict]) -> ResourcePlan:
        """
        Generate a resource plan across all construction phases.
        phase_weeks: list of dicts with 'name' and 'adjusted_weeks' from ScheduleEngine.
        """
        state = CITY_TO_STATE.get(project.city, "DL")
        rates = LABOUR_RATES.get(state, LABOUR_RATES["DL"])

        floor_factor = 1.0 + max(0, project.floors - 2) * 0.15

        resources: list[ResourceItem] = []
        total_days = 0
        peak = 0
        total_cost = 0.0

        for phase_info in phase_weeks:
            name = phase_info["name"]
            weeks = phase_info.get("adjusted_weeks", phase_info.get("base_weeks", 6))
            template = CREW_TEMPLATES.get(name, {"mason": 2, "helper": 4, "equipment": []})

            crew: dict[str, int] = {}
            equipment: list[str] = []

            if isinstance(template, dict):
                for key, val in template.items():
                    if key == "equipment":
                        equipment = list(val) if isinstance(val, list) else [str(val)]
                    else:
                        scaled = max(1, round(val * floor_factor))
                        crew[key] = scaled

            # Daily labour cost
            daily = sum(rates.get(role, 500) * count for role, count in crew.items())
            phase_days = weeks * 6  # 6 working days per week
            phase_cost = daily * phase_days

            total_days += phase_days
            peak = max(peak, sum(crew.values()))
            total_cost += phase_cost

            resources.append(
                ResourceItem(
                    phase_name=name,
                    crew=crew,
                    equipment=equipment,
                    daily_labour_cost=round(daily, 0),
                )
            )

        return ResourcePlan(
            resources=resources,
            total_labour_days=total_days,
            peak_workforce=peak,
            total_labour_cost_lakhs=round(total_cost / 100_000.0, 2),
        )
