"""
BuildAtlas GenAI — Reverse Planning Engine
Constraint solver: given budget + deadline, output 3 feasible build configurations.
"""

from __future__ import annotations

import math

from app.data.mock_data import CITY_RATES, QUALITY_MULTIPLIERS
from app.models import BuildConfig, ProjectInput, ReversePlanResult


class ReversePlanningEngine:
    """Stateless reverse-planning engine: budget-first → feasible options."""

    FALLBACK_CITY = "Tier-2"

    def solve(self, project: ProjectInput) -> ReversePlanResult:
        """
        Generate 3 build configurations (economy/standard/premium) that
        fit within the given budget and deadline constraints.
        """
        budget = project.budget_lakhs or 100.0
        deadline = project.deadline_months or 18
        city = project.city
        project_type = project.project_type.value

        city_rates = CITY_RATES.get(city, CITY_RATES[self.FALLBACK_CITY])
        base_rate = city_rates.get(project_type, city_rates["residential"])

        options: list[BuildConfig] = []
        for grade_key in ("economy", "standard", "premium"):
            grade = QUALITY_MULTIPLIERS[grade_key]
            effective_rate = base_rate * grade["rate_multiplier"]

            # Feasible sqft within budget (rate is per sqft, budget in lakhs)
            feasible_sqft = (budget * 100_000.0) / effective_rate
            feasible_sqft = round(feasible_sqft, 0)

            # Estimated months based on sqft and time multiplier
            base_months = self._base_duration_months(feasible_sqft, project.floors)
            required_months = round(base_months * grade["time_multiplier"], 1)
            timeline_ok = required_months <= deadline

            # What gets cut to fit budget
            cuts = self._determine_cuts(grade_key, budget, feasible_sqft, city)

            # Value score: higher is better (sqft per lakh × timeline fit bonus)
            sqft_per_lakh = feasible_sqft / budget if budget > 0 else 0
            value_score = sqft_per_lakh * (1.2 if timeline_ok else 0.7)

            estimated_cost = round(budget, 2)  # by definition, we use full budget

            options.append(
                BuildConfig(
                    grade=grade_key,
                    label=grade["label"],
                    feasible_sqft=feasible_sqft,
                    estimated_cost_lakhs=estimated_cost,
                    required_months=required_months,
                    timeline_feasible=timeline_ok,
                    what_gets_cut=cuts,
                    description=grade["desc"],
                    value_score=round(value_score, 2),
                )
            )

        options.sort(key=lambda o: o.value_score, reverse=True)

        return ReversePlanResult(
            budget_lakhs=budget,
            deadline_months=deadline,
            city=city,
            options=options,
            ai_recommendation=None,  # filled by Gemini later
        )

    # ── Internal Methods ───────────────────────────────────────────────

    @staticmethod
    def _base_duration_months(sqft: float, floors: int) -> float:
        """Rough duration estimate based on area and floors."""
        base = 10.0  # minimum 10 months for any project
        area_factor = sqft / 3000.0  # +1 month per 3000 sqft
        floor_factor = max(0, floors - 1) * 1.5  # +1.5 months per floor
        return base + area_factor + floor_factor

    @staticmethod
    def _determine_cuts(
        grade: str, budget: float, sqft: float, city: str
    ) -> list[str]:
        """Identify what compromises are needed for this configuration."""
        cuts: list[str] = []

        if grade == "economy":
            cuts.append("Load-bearing walls (no RCC frame)")
            cuts.append("Basic vitrified flooring only")
            cuts.append("No modular kitchen")
            cuts.append("Standard sanitary ware (no branded fittings)")
            if budget < 60:
                cuts.append("Single bathroom only")

        elif grade == "standard":
            cuts.append("Standard UPVC windows (no aluminium sliding)")
            cuts.append("Semi-modular kitchen")
            if budget < 100:
                cuts.append("No separate utility room")

        elif grade == "premium":
            if sqft < 2000:
                cuts.append("Limited premium area — consider reducing BHK count")
            cuts.append("Premium fittings may extend timeline by 3–4 weeks")
            metro_premium_cities = {"Mumbai", "Delhi NCR", "Bengaluru"}
            if city in metro_premium_cities:
                cuts.append("Metro labour premium adds 8–12% to finishing cost")

        return cuts
