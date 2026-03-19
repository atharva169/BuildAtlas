"""Resource Engine — crew composition and equipment by phase."""
from backend.engines.base import BaseEngine
from backend.models.schemas import (
    ProjectInput, ResourceResponse, CrewAllocation, ScheduleResponse
)


# Crew ratios per phase (per 1000 sqft)
CREW_TEMPLATES = {
    "approvals": {
        "workers": {},
        "equipment": [],
        "materials": ["Survey instruments", "Documentation"]
    },
    "foundation": {
        "workers": {"mason": 3, "helper": 6, "bar_bender": 2},
        "equipment": ["JCB Excavator", "Concrete Mixer", "Vibrator"],
        "materials": ["Cement", "Steel", "Sand", "Aggregate", "Anti-termite chemical"]
    },
    "structure": {
        "workers": {"mason": 4, "helper": 8, "bar_bender": 3, "carpenter": 2},
        "equipment": ["Concrete Mixer", "Vibrator", "Shuttering plates", "Tower crane (if G+3)"],
        "materials": ["RCC M25", "TMT Steel", "Shuttering plywood"]
    },
    "masonry": {
        "workers": {"mason": 4, "helper": 6},
        "equipment": ["Material hoist", "Scaffolding"],
        "materials": ["Bricks/AAC blocks", "Cement mortar", "Sand"]
    },
    "mep": {
        "workers": {"electrician": 2, "plumber": 2, "helper": 3},
        "equipment": ["Pipe threading machine", "Wire pulling tools"],
        "materials": ["CPVC pipes", "Electrical wire", "MCBs", "Conduits"]
    },
    "finishing": {
        "workers": {"mason": 2, "painter": 3, "carpenter": 2, "helper": 4},
        "equipment": ["Tile cutter", "Paint sprayer", "Sanding machine"],
        "materials": ["Tiles", "Paint", "Putty", "Doors", "Windows", "Sanitary fittings"]
    },
}


class ResourceEngine(BaseEngine):
    """Optimal crew composition by phase."""

    def compute(self, project_input: ProjectInput,
                schedule: ScheduleResponse = None, **kwargs) -> ResourceResponse:
        state = project_input.state.lower()
        num_floors = project_input.num_floors
        area_factor = (project_input.plot_width_ft * project_input.plot_depth_ft * 0.7 * num_floors) / 1000

        labour_data = self.data.get_labour_rates(state)
        crew_plan = []
        total_mandays = 0
        peak_workers = 0
        all_equipment = set()

        phases = schedule.phases if schedule else []

        for phase in phases:
            tmpl = CREW_TEMPLATES.get(phase.id, {})
            workers = {}
            
            for role, base_count in tmpl.get("workers", {}).items():
                count = max(1, int(base_count * max(1, area_factor * 0.7)))
                workers[role] = count
                total_mandays += count * phase.duration_days

            phase_total = sum(workers.values())
            peak_workers = max(peak_workers, phase_total)
            all_equipment.update(tmpl.get("equipment", []))

            crew_plan.append(CrewAllocation(
                phase_id=phase.id,
                phase_name=phase.name,
                workers=workers,
                equipment=tmpl.get("equipment", []),
                materials_needed=tmpl.get("materials", []),
                duration_days=phase.duration_days,
            ))

        return ResourceResponse(
            crew_plan=crew_plan,
            total_mandays=total_mandays,
            peak_workers=peak_workers,
            equipment_list=sorted(all_equipment),
        )
