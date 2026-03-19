"""Reverse Planning Engine — budget + deadline → feasible configurations."""
from backend.engines.base import BaseEngine
from backend.models.schemas import (
    ProjectInput, ReverseResponse, BuildConfig
)


# Material tiers with cost multipliers
TIERS = {
    "economy": {
        "label": "Economy",
        "cost_mult": 0.75,
        "materials": {
            "brick": "fly_ash_brick",
            "cement": "ppc",
            "sand": "msand",
            "tiles": "ceramic",
            "door": "flush",
            "paint": "standard",
        },
        "trade_offs": [
            "Fly ash bricks instead of AAC/red brick",
            "PPC cement (slower early strength)",
            "Ceramic tiles instead of vitrified",
            "Flush doors throughout",
            "Standard paint finish",
            "No waterproofing on external walls",
        ],
    },
    "standard": {
        "label": "Standard",
        "cost_mult": 1.0,
        "materials": {
            "brick": "aac",
            "cement": "opc",
            "sand": "msand",
            "tiles": "vitrified",
            "door": "mixed",
            "paint": "premium",
        },
        "trade_offs": [
            "AAC blocks — good insulation",
            "OPC 53 cement for all structural",
            "Vitrified tiles in living areas",
            "Teak main door, flush internal",
            "Premium emulsion paint",
            "External wall waterproofing included",
        ],
    },
    "premium": {
        "label": "Premium",
        "cost_mult": 1.35,
        "materials": {
            "brick": "aac",
            "cement": "opc",
            "sand": "msand",
            "tiles": "italian_marble",
            "door": "teak",
            "paint": "luxury",
        },
        "trade_offs": [
            "AAC blocks with thermal insulation layer",
            "OPC 53 + admixtures for high strength",
            "Italian marble/premium vitrified flooring",
            "Solid teak doors throughout",
            "Luxury paint with texture finish",
            "Complete waterproofing + anti-dampness",
            "Concealed MEP with premium fittings",
        ],
    },
}


class ReverseEngine(BaseEngine):
    """Budget-first planning — enter budget, get feasible configs."""

    def compute(self, project_input: ProjectInput, **kwargs) -> ReverseResponse:
        budget = project_input.budget_inr or 5000000
        deadline = project_input.deadline_months
        num_floors = project_input.num_floors
        plot_area = project_input.plot_width_ft * project_input.plot_depth_ft * 0.7

        # Base cost per sqft (varies by city)
        base_cost_per_sqft = 1800
        city_mult = self.data.get_city_multiplier(project_input.city, "material")
        labour_mult = self.data.get_city_multiplier(project_input.city, "labour")
        avg_mult = (city_mult + labour_mult) / 2
        adjusted_cost = base_cost_per_sqft * avg_mult

        configs = []
        feasibility_notes = []

        for tier_id, tier in TIERS.items():
            tier_cost = adjusted_cost * tier["cost_mult"]
            # What area can the budget buy?
            affordable_area = budget / tier_cost
            max_floors = min(4, max(1, int(affordable_area / plot_area)))
            actual_area = min(affordable_area, plot_area * max_floors)
            estimated_cost = round(actual_area * tier_cost)

            # Timeline estimate (rough: 5 months per floor for standard)
            base_months = 5 + (max_floors - 1) * 3
            timeline_months = int(base_months * (1.1 if tier_id == "premium" else 
                                                  0.9 if tier_id == "economy" else 1.0))

            configs.append(BuildConfig(
                tier=tier_id,
                estimated_cost=estimated_cost,
                area_sqft=round(actual_area),
                num_floors=max_floors,
                material_choices=tier["materials"],
                timeline_months=timeline_months,
                trade_offs=tier["trade_offs"],
            ))

        if deadline:
            feasibility_notes.append(
                f"Your deadline of {deadline} months "
                + ("is feasible for all tiers." if deadline >= configs[-1].timeline_months
                   else f"may require timeline compression. Standard build takes ~{configs[1].timeline_months} months.")
            )

        feasibility_notes.append(
            f"Budget ₹{budget:,.0f} in {project_input.city.title()} "
            f"(cost multiplier: {avg_mult:.2f}x)"
        )

        return ReverseResponse(
            configs=configs,
            budget=budget,
            deadline_months=deadline,
            feasibility_notes=feasibility_notes,
        )
