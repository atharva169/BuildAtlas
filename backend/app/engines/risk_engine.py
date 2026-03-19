"""
BuildAtlas GenAI — Risk Scoring Engine
Weighted multi-factor risk assessment for Indian construction projects.
Scores on 1–10 scale.  Severity: critical ≥ 7, medium 4–6.9, low < 4.
"""

from __future__ import annotations

from app.data.mock_data import CITY_TO_STATE, MONSOON_MONTHS
from app.models import ProjectInput, RiskItem, RiskRegister


class RiskEngine:
    """Stateless risk assessment engine using rule-based factor scoring."""

    def assess(self, project: ProjectInput) -> RiskRegister:
        """Score all risk factors for the given project and return a register."""
        risks: list[RiskItem] = [
            self._steel_price_risk(project),
            self._labour_shortage_risk(project),
            self._regulatory_delay_risk(project),
            self._weather_monsoon_risk(project),
            self._supply_chain_risk(project),
        ]

        weighted_sum = sum(r.score * r.weight for r in risks)
        total_weight = sum(r.weight for r in risks)
        overall = round(weighted_sum / total_weight, 1) if total_weight > 0 else 0.0

        top = [r.risk_id for r in risks if r.severity == "critical"]

        return RiskRegister(risks=risks, overall_score=overall, top_risks=top)

    # ── Individual Risk Factors ────────────────────────────────────────

    def _steel_price_risk(self, p: ProjectInput) -> RiskItem:
        """Steel price volatility risk — higher in metro cities."""
        high_cities = {"Bengaluru", "Mumbai", "Delhi NCR", "Pune"}
        score = 8.2 if p.city in high_cities else 6.5
        if p.project_type.value == "commercial":
            score = min(10.0, score + 0.8)

        return RiskItem(
            risk_id="steel_price",
            category="Financial",
            title="Steel Price Volatility (Fe-500D TMT)",
            score=round(score, 1),
            weight=0.25,
            severity=self._severity(score),
            mitigation="Lock forward rate contract with TMT supplier by Month 2. "
                       "Consider staggered procurement to average out price swings.",
        )

    def _labour_shortage_risk(self, p: ProjectInput) -> RiskItem:
        """Labour shortage risk — peaks during festival/harvest season (Sep–Nov)."""
        score = 7.1 if p.start_month in (9, 10, 11) else 4.5
        tier2_cities = {"Ahmedabad", "Kolkata"}
        if p.city in tier2_cities:
            score = min(10.0, score + 1.2)

        return RiskItem(
            risk_id="labour_shortage",
            category="Workforce",
            title="Labour Shortage & Migration Risk",
            score=round(score, 1),
            weight=0.20,
            severity=self._severity(score),
            mitigation="Pre-book subcontractor crews 60 days before mobilisation. "
                       "Offer weekly wage settlements to retain migrant labour.",
        )

    def _regulatory_delay_risk(self, p: ProjectInput) -> RiskItem:
        """Approval and regulatory delay risk — city-dependent."""
        slow_cities = {"Mumbai": 8.5, "Delhi NCR": 7.8, "Bengaluru": 7.0}
        score = slow_cities.get(p.city, 5.5)
        if p.floors > 4:
            score = min(10.0, score + 1.0)  # high-rise = more scrutiny

        return RiskItem(
            risk_id="regulatory_delay",
            category="Regulatory",
            title="Plan Sanction & NOC Delays",
            score=round(score, 1),
            weight=0.20,
            severity=self._severity(score),
            mitigation="Engage liaison officer for municipal approvals. "
                       "File RERA registration in parallel with plan-sanction application.",
        )

    def _weather_monsoon_risk(self, p: ProjectInput) -> RiskItem:
        """Monsoon overlap risk for outdoor construction phases."""
        state = CITY_TO_STATE.get(p.city, "")
        monsoon = MONSOON_MONTHS.get(state, [])

        # Check if project start + first 6 months overlaps monsoon
        overlap_count = 0
        for m_offset in range(6):
            check_month = ((p.start_month - 1 + m_offset) % 12) + 1
            if check_month in monsoon:
                overlap_count += 1

        score = min(10.0, 3.0 + overlap_count * 1.5)

        return RiskItem(
            risk_id="weather_monsoon",
            category="Weather",
            title="Monsoon Season Construction Disruption",
            score=round(score, 1),
            weight=0.20,
            severity=self._severity(score),
            mitigation="Schedule earthwork and foundation before monsoon onset. "
                       "Install temporary drainage and dewatering on-site per IS 3764.",
        )

    def _supply_chain_risk(self, p: ProjectInput) -> RiskItem:
        """Material supply chain risk — availability and logistics."""
        remote_cities = {"Kolkata", "Ahmedabad"}
        score = 6.8 if p.city in remote_cities else 4.2
        if p.quality.value in ("premium", "luxury"):
            score = min(10.0, score + 1.5)  # imported fittings = higher risk

        return RiskItem(
            risk_id="supply_chain",
            category="Supply Chain",
            title="Material Availability & Logistics",
            score=round(score, 1),
            weight=0.15,
            severity=self._severity(score),
            mitigation="Identify 2 alternate suppliers for key materials (cement, steel, sand). "
                       "Maintain 15-day buffer stock on site.",
        )

    # ── Helpers ────────────────────────────────────────────────────────

    @staticmethod
    def _severity(score: float) -> str:
        """Map numeric score to severity label."""
        if score >= 7.0:
            return "critical"
        if score >= 4.0:
            return "medium"
        return "low"
