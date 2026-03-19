"""What-If Engine — pure delta calculator, no LLM."""
from backend.engines.base import BaseEngine
from backend.models.schemas import (
    ProjectInput, WhatIfParams, WhatIfResponse, CostResponse, ScheduleResponse
)


class WhatIfEngine(BaseEngine):
    """Instant delta calculator for what-if scenarios."""

    def compute(self, project_input: ProjectInput,
                params: WhatIfParams = None,
                cost: CostResponse = None,
                schedule: ScheduleResponse = None, **kwargs) -> WhatIfResponse:
        if not params:
            params = WhatIfParams()
        if not cost:
            return WhatIfResponse(
                original_cost=0, new_cost=0, cost_delta=0, cost_delta_pct=0,
                original_days=0, new_days=0, days_delta=0, risk_delta=0, breakdown=[]
            )

        original_cost = cost.total_p50
        original_days = schedule.total_duration_days if schedule else 180

        breakdown = []
        total_delta = 0

        # Steel price impact
        if params.steel_price_delta_pct != 0:
            steel_cost = cost.cost_by_category.get("structure", 0) * 0.5
            delta = steel_cost * (params.steel_price_delta_pct / 100)
            total_delta += delta
            breakdown.append({
                "factor": "Steel Price",
                "delta_pct": params.steel_price_delta_pct,
                "cost_impact": round(delta),
            })

        # Cement price impact
        if params.cement_price_delta_pct != 0:
            cement_cost = cost.cost_by_category.get("structure", 0) * 0.3
            delta = cement_cost * (params.cement_price_delta_pct / 100)
            total_delta += delta
            breakdown.append({
                "factor": "Cement Price",
                "delta_pct": params.cement_price_delta_pct,
                "cost_impact": round(delta),
            })

        # Labour rate impact
        if params.labour_rate_delta_pct != 0:
            labour_cost = cost.cost_by_category.get("labour", 0)
            delta = labour_cost * (params.labour_rate_delta_pct / 100)
            total_delta += delta
            breakdown.append({
                "factor": "Labour Rate",
                "delta_pct": params.labour_rate_delta_pct,
                "cost_impact": round(delta),
            })

        # Timeline compression (crashing cost = 15% premium per 10% compression)
        days_delta = 0
        if params.timeline_compression_pct != 0:
            compression = params.timeline_compression_pct / 100
            days_saved = int(original_days * compression)
            days_delta = -days_saved
            crash_premium = abs(compression) * 1.5 * original_cost * 0.1
            total_delta += crash_premium
            breakdown.append({
                "factor": "Timeline Compression",
                "delta_pct": params.timeline_compression_pct,
                "cost_impact": round(crash_premium),
                "days_impact": -days_saved,
            })

        # Monsoon extension
        if params.monsoon_extension_weeks > 0:
            extra_days = params.monsoon_extension_weeks * 7
            days_delta += extra_days
            idle_cost = (cost.cost_by_category.get("labour", 0) / original_days) * extra_days * 0.5
            total_delta += idle_cost
            breakdown.append({
                "factor": "Monsoon Extension",
                "weeks": params.monsoon_extension_weeks,
                "cost_impact": round(idle_cost),
                "days_impact": extra_days,
            })

        new_cost = round(original_cost + total_delta)
        new_days = original_days + days_delta

        # Risk increases with cost overrun and timeline extension
        risk_delta = 0
        if total_delta > 0:
            risk_delta = round(total_delta / original_cost * 5, 2)
        if days_delta > 0:
            risk_delta += round(days_delta / original_days * 3, 2)

        return WhatIfResponse(
            original_cost=original_cost,
            new_cost=new_cost,
            cost_delta=round(total_delta),
            cost_delta_pct=round(total_delta / original_cost * 100, 1) if original_cost else 0,
            original_days=original_days,
            new_days=new_days,
            days_delta=days_delta,
            risk_delta=round(risk_delta, 2),
            breakdown=breakdown,
        )
