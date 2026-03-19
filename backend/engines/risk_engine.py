"""Risk Engine — weighted scoring across 5 categories."""
from backend.engines.base import BaseEngine
from backend.models.schemas import (
    ProjectInput, RiskResponse, RiskItem, CostResponse, ScheduleResponse
)


RISK_CATEGORIES = [
    {
        "id": "weather",
        "category": "Weather & Season",
        "title": "Monsoon / Weather Disruption",
        "base_prob": 0.4,
        "base_impact": 6,
    },
    {
        "id": "regulatory",
        "category": "Regulatory",
        "title": "Approval Delays & Compliance",
        "base_prob": 0.5,
        "base_impact": 7,
    },
    {
        "id": "supply_chain",
        "category": "Supply Chain",
        "title": "Material Price Volatility & Supply",
        "base_prob": 0.6,
        "base_impact": 5,
    },
    {
        "id": "labour",
        "category": "Labour",
        "title": "Labour Availability & Migration",
        "base_prob": 0.3,
        "base_impact": 5,
    },
    {
        "id": "financial",
        "category": "Financial",
        "title": "Budget Overrun & Cash Flow",
        "base_prob": 0.4,
        "base_impact": 8,
    },
]

DEFAULT_NARRATIVES = {
    "weather": "Monsoon season may impact outdoor construction phases. Foundation and structural work should be planned around the lockout window.",
    "regulatory": "Building plan approvals and RERA registration involve processing delays. Early application recommended to avoid schedule slippage.",
    "supply_chain": "Steel and cement prices show seasonal volatility. Consider forward contracts or bulk procurement to lock in rates.",
    "labour": "Seasonal migration patterns may affect mason and helper availability. Plan procurement from local labour nakas during peak season.",
    "financial": "Cost overruns typically stem from scope changes and material price increases. Maintain 10-15% contingency budget.",
}


class RiskEngine(BaseEngine):
    """Weighted risk scoring — rules compute, LLM narrates."""

    def compute(self, project_input: ProjectInput,
                cost: CostResponse = None,
                schedule: ScheduleResponse = None, **kwargs) -> RiskResponse:
        state = project_input.state.lower()
        city = project_input.city.lower()
        num_floors = project_input.num_floors

        monsoon = self.data.get_monsoon_lockout(state)
        labour_data = self.data.get_labour_rates(state)

        risks = []
        for tmpl in RISK_CATEGORIES:
            prob = tmpl["base_prob"]
            impact = tmpl["base_impact"]

            # Adjust based on project specifics
            if tmpl["id"] == "weather":
                if monsoon["severity"] == "heavy":
                    prob = min(0.9, prob + 0.2)
                    impact = min(10, impact + 1)
                elif monsoon["severity"] == "light":
                    prob = max(0.1, prob - 0.15)

            elif tmpl["id"] == "regulatory":
                if num_floors >= 4:
                    prob = min(0.85, prob + 0.15)  # fire NOC required
                    impact = min(10, impact + 1)

            elif tmpl["id"] == "supply_chain":
                if cost and cost.total_p90 and cost.total_p10:
                    variance_ratio = (cost.total_p90 - cost.total_p10) / cost.total_p50
                    if variance_ratio > 0.3:
                        prob = min(0.85, prob + 0.15)
                        impact = min(10, impact + 1)

            elif tmpl["id"] == "labour":
                migration_flag = labour_data.get("migration_flag", "")
                if "shortage" in migration_flag.lower() or "influx" in migration_flag.lower():
                    prob = min(0.7, prob + 0.15)

            elif tmpl["id"] == "financial":
                if project_input.budget_inr and cost and cost.total_p50:
                    if cost.total_p50 > project_input.budget_inr * 0.9:
                        prob = min(0.9, prob + 0.25)
                        impact = min(10, impact + 2)

            score = round(prob * impact, 2)
            severity = (
                "critical" if score >= 6 else
                "high" if score >= 4 else
                "medium" if score >= 2 else "low"
            )

            risks.append(RiskItem(
                id=tmpl["id"],
                category=tmpl["category"],
                title=tmpl["title"],
                probability=round(prob, 2),
                impact=round(impact, 1),
                score=score,
                severity=severity,
                default_narrative=DEFAULT_NARRATIVES[tmpl["id"]],
                narrative="",  # filled by AI layer
            ))

        risks.sort(key=lambda r: r.score, reverse=True)
        overall = round(sum(r.score for r in risks) / len(risks), 2)

        return RiskResponse(
            risks=risks,
            overall_score=overall,
            top_risk=risks[0].title if risks else "",
            narrative_context={
                "project_type": project_input.building_type,
                "city": city,
                "state": state,
                "num_floors": num_floors,
                "total_cost_p50": cost.total_p50 if cost else 0,
                "risks": [r.model_dump() for r in risks],
            },
        )
