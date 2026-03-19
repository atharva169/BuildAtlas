"""Material Swap Engine — trade-off matrix lookup."""
from backend.engines.base import BaseEngine
from backend.models.schemas import (
    ProjectInput, MaterialSwapResponse, SwapResult
)


class MaterialSwapEngine(BaseEngine):
    """Interactive material substitution matrix."""

    def compute(self, project_input: ProjectInput = None,
                swap_from: str = None, swap_to: str = None,
                **kwargs) -> MaterialSwapResponse:
        subs = self.data.materials_db.get("substitutions", {})
        materials = self.data.cpwd_dsr.get("materials", {})

        swaps = []

        if swap_from and swap_to:
            # Find specific swap
            for sub_id, sub in subs.items():
                if sub["original"] == swap_from and sub["replacement"] == swap_to:
                    orig_info = materials.get(sub["original"], {})
                    repl_info = materials.get(sub["replacement"], {})
                    swaps.append(SwapResult(
                        original=sub["original"],
                        replacement=sub["replacement"],
                        original_name=orig_info.get("name", sub["original"]),
                        replacement_name=repl_info.get("name", sub["replacement"]),
                        cost_delta_pct=sub["cost_delta_pct"],
                        time_delta_pct=sub.get("time_delta_pct", 0),
                        weight_reduction_pct=sub.get("weight_reduction_pct", 0),
                        strength=sub.get("strength", "equivalent"),
                        original_is_code=sub.get("original_is_code", ""),
                        replacement_is_code=sub.get("replacement_is_code", ""),
                        notes=sub.get("notes", ""),
                    ))
        else:
            # Return all available swaps
            for sub_id, sub in subs.items():
                orig_info = materials.get(sub["original"], {})
                repl_info = materials.get(sub["replacement"], {})
                swaps.append(SwapResult(
                    original=sub["original"],
                    replacement=sub["replacement"],
                    original_name=orig_info.get("name", sub["original"]),
                    replacement_name=repl_info.get("name", sub["replacement"]),
                    cost_delta_pct=sub["cost_delta_pct"],
                    time_delta_pct=sub.get("time_delta_pct", 0),
                    weight_reduction_pct=sub.get("weight_reduction_pct", 0),
                    strength=sub.get("strength", "equivalent"),
                    original_is_code=sub.get("original_is_code", ""),
                    replacement_is_code=sub.get("replacement_is_code", ""),
                    notes=sub.get("notes", ""),
                ))

        return MaterialSwapResponse(swaps=swaps)
