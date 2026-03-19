"""
BuildAtlas GenAI — Cost Estimation Engine
Deterministic rule engine: P10/P50/P90 bands, BOQ breakdown, what-if delta.
All monetary values are in ₹ lakhs unless otherwise noted.
"""

from __future__ import annotations

from app.data.mock_data import (
    BOQ_COMPONENTS,
    CITY_RATES,
    QUALITY_MULTIPLIERS,
)
from app.models import (
    BOQItem,
    CostBand,
    CostEstimate,
    ProjectInput,
    WhatIfParams,
    WhatIfResult,
)


class CostEngine:
    """Stateless cost estimation engine for Indian construction projects."""

    # ── Confidence band multipliers ────────────────────────────────────
    P10_FACTOR: float = 0.845   # optimistic: −15.5% (bulk discounts, smooth execution)
    P90_FACTOR: float = 1.256   # pessimistic: +25.6% (delays, rework, escalation)

    # Tier-2 cities not in CITY_RATES get this fallback key
    FALLBACK_CITY: str = "Tier-2"

    # ── Public API ─────────────────────────────────────────────────────

    def estimate(self, project: ProjectInput) -> CostEstimate:
        """Run the full estimation pipeline and return a CostEstimate."""
        city_rate = self._city_rate(project.city, project.project_type.value)
        quality_mult = QUALITY_MULTIPLIERS.get(
            project.quality.value, QUALITY_MULTIPLIERS["standard"]
        )["rate_multiplier"]
        structural_mult = self._structural_multiplier(project.floors)

        p50 = self._calculate_p50(
            project.builtup_sqft, city_rate, quality_mult, structural_mult
        )
        p10, p90 = self._confidence_bands(p50)

        boq = self._generate_boq(p50)
        variance_driver = self._identify_variance_driver(project)

        return CostEstimate(
            total=CostBand(p10=round(p10, 2), p50=round(p50, 2), p90=round(p90, 2)),
            cost_per_sqft=CostBand(
                p10=round(p10 * 100000 / project.builtup_sqft, 0),
                p50=round(p50 * 100000 / project.builtup_sqft, 0),
                p90=round(p90 * 100000 / project.builtup_sqft, 0),
            ),
            boq=boq,
            city=project.city,
            city_rate_used=city_rate,
            quality_multiplier=quality_mult,
            structural_multiplier=structural_mult,
            variance_driver=variance_driver,
        )

    def what_if(self, project: ProjectInput, params: WhatIfParams) -> WhatIfResult:
        """Calculate delta impact of what-if parameter changes."""
        base_estimate = self.estimate(project)
        p50 = base_estimate.total.p50

        steel_impact = self._steel_impact(p50, params.steel_price_pct)
        labour_impact = self._labour_impact(p50, params.labour_rate_pct)
        time_impact = self._time_impact(params.timeline_weeks)
        cement_impact = self._cement_impact(p50, params.cement_price_pct)

        total_delta = steel_impact + labour_impact + time_impact + cement_impact
        new_p50 = p50 + total_delta

        return WhatIfResult(
            original_p50_lakhs=round(p50, 2),
            new_p50_lakhs=round(new_p50, 2),
            delta_lakhs=round(total_delta, 2),
            delta_pct=round((total_delta / p50) * 100.0, 2) if p50 > 0 else 0.0,
            steel_impact_lakhs=round(steel_impact, 2),
            labour_impact_lakhs=round(labour_impact, 2),
            time_impact_lakhs=round(time_impact, 2),
            cement_impact_lakhs=round(cement_impact, 2),
        )

    # ── Internal Methods ───────────────────────────────────────────────

    def _city_rate(self, city: str, project_type: str) -> float:
        """Look up ₹/sqft base rate; fall back to Tier-2 if city unknown."""
        rates = CITY_RATES.get(city, CITY_RATES[self.FALLBACK_CITY])
        return rates.get(project_type, rates["residential"])

    @staticmethod
    def _structural_multiplier(floors: int) -> float:
        """Each additional floor above G+1 adds 15% structural premium."""
        return 1.0 + max(0, floors - 1) * 0.15

    @staticmethod
    def _calculate_p50(
        builtup_sqft: float,
        city_rate: float,
        quality_mult: float,
        structural_mult: float,
    ) -> float:
        """
        P50 base cost in ₹ lakhs.
        Formula: (sqft × rate × quality × structural) / 100_000
        """
        raw = builtup_sqft * city_rate * quality_mult * structural_mult
        return raw / 100_000.0

    def _confidence_bands(self, p50: float) -> tuple[float, float]:
        """Return (p10, p90) derived from P50."""
        return p50 * self.P10_FACTOR, p50 * self.P90_FACTOR

    @staticmethod
    def _generate_boq(p50: float) -> list[BOQItem]:
        """Allocate P50 across BOQ component percentages."""
        items: list[BOQItem] = []
        for idx, (category, pct) in enumerate(BOQ_COMPONENTS.items(), start=1):
            items.append(
                BOQItem(
                    sno=idx,
                    category=category,
                    percentage=round(pct * 100, 1),
                    amount_lakhs=round(p50 * pct, 2),
                )
            )
        return items

    @staticmethod
    def _identify_variance_driver(project: ProjectInput) -> str:
        """Determine the primary source of cost variance for this project."""
        if project.project_type == "commercial":
            return "Cement & concrete volumes drive variance in commercial projects"
        state_lookup = {
            "Bengaluru": "KA", "Hyderabad": "TS", "Chennai": "TN",
            "Pune": "MH", "Mumbai": "MH", "Delhi NCR": "DL",
            "Kolkata": "WB", "Ahmedabad": "GJ",
        }
        tier2_states = {"WB", "GJ"}
        if state_lookup.get(project.city, "") in tier2_states:
            return "Labour availability and wage inflation in Tier-2 regions"
        return "Steel price volatility (Fe-500D TMT) drives ±18% P10-P90 spread"

    # ── What-If Impact Helpers ─────────────────────────────────────────

    @staticmethod
    def _steel_impact(p50: float, steel_pct: float) -> float:
        """Steel impact: steel is 38% of Civil & Structure (42% of total)."""
        return p50 * 0.42 * 0.38 * (steel_pct / 100.0)

    @staticmethod
    def _labour_impact(p50: float, labour_pct: float) -> float:
        """Labour impact: 10% of total cost."""
        return p50 * 0.10 * (labour_pct / 100.0)

    @staticmethod
    def _time_impact(timeline_weeks: float) -> float:
        """Time overrun cost at ₹0.35 lakh per week (site overhead + interest)."""
        return timeline_weeks * 0.35

    @staticmethod
    def _cement_impact(p50: float, cement_pct: float) -> float:
        """Cement is roughly 25% of Civil & Structure (42% of total)."""
        return p50 * 0.42 * 0.25 * (cement_pct / 100.0)
