"""Cost Engine — BOQ calculation with P10/P50/P90 confidence bands."""
import math
from backend.engines.base import BaseEngine
from backend.models.schemas import (
    ProjectInput, CostResponse, BOQLineItem, FloorPlanResponse
)


class CostEngine(BaseEngine):
    """Deterministic BOQ cost calculator.
    
    Steps:
    1. Calculate total built-up area from floor plan
    2. Look up quantity norms per material for building type
    3. Apply city multipliers to base rates
    4. Compute P10/P50/P90 using variance coefficients
    5. Flag primary variance driver
    """

    def compute(self, project_input: ProjectInput,
                floorplan: FloorPlanResponse = None, **kwargs) -> CostResponse:
        city = project_input.city.lower()
        state = project_input.state.lower()
        btype = project_input.building_type
        num_floors = project_input.num_floors
        prefs = project_input.material_preferences

        # Total area
        if floorplan:
            area_sqft = floorplan.total_built_area
            num_rooms = len([r for r in floorplan.rooms
                           if "Bathroom" not in r.name and "Passage" not in r.name])
            num_bathrooms = len([r for r in floorplan.rooms
                               if "Bathroom" in r.name])
        else:
            area_sqft = project_input.plot_width_ft * project_input.plot_depth_ft * 0.7 * num_floors
            num_rooms = 3 if "2BHK" in project_input.bhk_config else 4
            num_bathrooms = 2

        materials = self.data.cpwd_dsr.get("materials", {})
        norms = self.data.cpwd_dsr.get("quantity_norms", {}).get(btype, {})

        boq = []
        cost_by_category = {}
        max_variance_item = ("", 0)

        for mat_key, mat_info in materials.items():
            # Handle material preferences (e.g. user chose AAC over red brick)
            if mat_key in ("red_brick", "fly_ash_brick") and prefs.get("brick") == "aac":
                if mat_key != "aac_block":
                    continue
            if mat_key == "aac_block" and prefs.get("brick", "aac") != "aac":
                continue
            if mat_key == "river_sand" and prefs.get("sand", "msand") == "msand":
                continue
            if mat_key == "m_sand" and prefs.get("sand") == "river":
                continue
            if mat_key == "ppc_cement" and prefs.get("cement", "opc") == "opc":
                continue
            if mat_key == "opc_53_cement" and prefs.get("cement") == "ppc":
                continue

            norm = norms.get(mat_key)
            if not norm:
                continue

            # Calculate quantity
            if "per_sqft" in norm:
                quantity = area_sqft * norm["per_sqft"]
            elif "per_floor" in norm:
                quantity = num_floors * norm["per_floor"]
            elif "per_room" in norm:
                quantity = num_rooms * norm["per_room"]
            elif "per_bathroom" in norm:
                quantity = num_bathrooms * norm["per_bathroom"]
            else:
                continue

            quantity = round(quantity, 2)
            base_rate = mat_info["base_rate_inr"]

            # Apply city multiplier
            cat = mat_info["category"]
            mult_type = "material" if cat in ("structure", "masonry", "foundation") else "overhead"
            city_mult = self.data.get_city_multiplier(city, mult_type)
            labour_mult = self.data.get_city_multiplier(city, "labour")
            
            # 70% material + 30% labour for most items
            effective_rate = base_rate * (0.7 * city_mult + 0.3 * labour_mult)
            effective_rate = round(effective_rate, 2)

            # P10/P50/P90 calculation
            vc = mat_info["variance_coefficient"]
            p50 = round(quantity * effective_rate, 0)
            p10 = round(p50 * (1 - vc * 1.28), 0)  # 10th percentile
            p90 = round(p50 * (1 + vc * 1.28), 0)  # 90th percentile

            variance_amount = p90 - p10
            if variance_amount > max_variance_item[1]:
                max_variance_item = (mat_info["name"], variance_amount)

            boq.append(BOQLineItem(
                category=cat,
                item=mat_info["name"],
                unit=mat_info["unit"],
                quantity=quantity,
                base_rate=base_rate,
                city_rate=effective_rate,
                p10_cost=p10,
                p50_cost=p50,
                p90_cost=p90,
                variance_driver=f"{mat_info['name']} price volatility ({vc*100:.0f}%)",
            ))

            cost_by_category[cat] = cost_by_category.get(cat, 0) + p50

        # Add labour cost estimate (as percentage of material)
        total_material = sum(cost_by_category.values())
        labour_cost = round(total_material * 0.30, 0)
        cost_by_category["labour"] = labour_cost

        total_p50 = total_material + labour_cost
        total_p10 = round(total_p50 * 0.85, 0)
        total_p90 = round(total_p50 * 1.20, 0)

        return CostResponse(
            boq=boq,
            total_p10=total_p10,
            total_p50=total_p50,
            total_p90=total_p90,
            primary_variance_driver=max_variance_item[0] or "Steel price",
            cost_by_category=cost_by_category,
            cost_per_sqft=round(total_p50 / area_sqft, 0) if area_sqft > 0 else 0,
        )
