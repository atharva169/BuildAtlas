"""Compliance Engine — rule-table lookup by state + project type."""
from backend.engines.base import BaseEngine
from backend.models.schemas import (
    ProjectInput, ComplianceResponse, ComplianceItem
)


class ComplianceEngine(BaseEngine):
    """Rule-table lookup for regulatory compliance checklist."""

    def compute(self, project_input: ProjectInput, **kwargs) -> ComplianceResponse:
        state = project_input.state.lower()
        btype = project_input.building_type
        num_floors = project_input.num_floors
        area = project_input.plot_width_ft * project_input.plot_depth_ft * 0.7 * num_floors

        rules = self.data.compliance_rules
        regs = rules.get("regulations", {})
        state_info = rules.get("state_specific", {}).get(state, {})

        items = []
        total_tat = 0

        for reg_id, reg in regs.items():
            # Check applicability
            if btype not in reg.get("applicable_to", []):
                continue
            if "min_area_sqft" in reg and area < reg["min_area_sqft"]:
                continue
            if "min_floors" in reg and num_floors < reg["min_floors"]:
                continue

            tat = reg.get("avg_tat_days", 30)
            if reg_id == "building_plan" and state_info:
                tat = state_info.get("avg_building_plan_tat", tat)

            items.append(ComplianceItem(
                regulation=reg["name"],
                authority=state_info.get("authority", "Municipal Authority"),
                required=True,
                avg_tat_days=tat,
                required_docs=reg.get("required_docs", []),
            ))
            total_tat = max(total_tat, tat)  # parallel approval

        # State-specific additional approvals
        for addl in state_info.get("additional_approvals", []):
            items.append(ComplianceItem(
                regulation=addl,
                authority=state_info.get("authority", "Municipal Authority"),
                required=True,
                avg_tat_days=20,
                required_docs=["Application form", "Supporting documents"],
            ))

        return ComplianceResponse(
            items=items,
            total_approval_days=total_tat,
            state_authority=state_info.get("authority", "Municipal Authority"),
            state_notes=state_info.get("notes", "Contact local municipal office"),
        )
