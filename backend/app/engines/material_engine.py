"""
BuildAtlas GenAI — Material Swap Engine
Trade-off analysis for material substitutions with IS code references.
"""

from __future__ import annotations

from app.data.mock_data import MATERIALS
from app.models import MaterialInfo, MaterialSwapResult


class MaterialEngine:
    """Stateless engine for material comparison and swap analysis."""

    def list_category(self, category: str) -> list[MaterialInfo]:
        """Return all materials in a category."""
        items = MATERIALS.get(category, [])
        return [self._to_info(m) for m in items]

    def list_categories(self) -> list[str]:
        """Return available material categories."""
        return list(MATERIALS.keys())

    def swap(
        self, category: str, original_id: str, alternative_id: str
    ) -> MaterialSwapResult:
        """Calculate trade-off deltas when swapping one material for another."""
        items = MATERIALS.get(category, [])
        orig = next((m for m in items if m["id"] == original_id), None)
        alt = next((m for m in items if m["id"] == alternative_id), None)

        if not orig or not alt:
            available = [m["id"] for m in items]
            raise ValueError(
                f"Material not found in '{category}'. Available: {available}"
            )

        orig_info = self._to_info(orig)
        alt_info = self._to_info(alt)

        cost_delta = (
            ((alt["base_cost"] - orig["base_cost"]) / orig["base_cost"]) * 100.0
            if orig["base_cost"] > 0
            else 0.0
        )
        time_delta = alt["time_delta_weeks"] - orig["time_delta_weeks"]
        strength_delta = alt["strength_pct"] - orig["strength_pct"]
        thermal_delta = alt["thermal_score"] - orig["thermal_score"]

        return MaterialSwapResult(
            original=orig_info,
            alternative=alt_info,
            cost_delta_pct=round(cost_delta, 1),
            time_delta_weeks=round(time_delta, 1),
            strength_delta_pct=round(strength_delta, 1),
            thermal_improvement=round(thermal_delta, 1),
            ai_recommendation=None,  # populated by Gemini if available
        )

    @staticmethod
    def _to_info(m: dict) -> MaterialInfo:
        """Convert raw dict to MaterialInfo model."""
        return MaterialInfo(
            id=m["id"],
            name=m["name"],
            is_code=m["is_code"],
            unit=m["unit"],
            base_cost=m["base_cost"],
            time_delta_weeks=m["time_delta_weeks"],
            strength_pct=m["strength_pct"],
            thermal_score=m["thermal_score"],
            availability_pct=m["availability_pct"],
            is_baseline=m["is_baseline"],
        )
