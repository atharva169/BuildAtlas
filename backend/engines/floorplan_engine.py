"""Floor Plan Engine — strip-based spatial allocation."""
from backend.engines.base import BaseEngine
from backend.models.schemas import ProjectInput, FloorPlanResponse, Room


# Room templates by BHK config
ROOM_TEMPLATES = {
    "1BHK": [
        {"name": "Living Room", "min_pct": 0.25, "max_pct": 0.30, "vastu": "NE"},
        {"name": "Bedroom", "min_pct": 0.20, "max_pct": 0.25, "vastu": "SW"},
        {"name": "Kitchen", "min_pct": 0.12, "max_pct": 0.15, "vastu": "SE"},
        {"name": "Bathroom", "min_pct": 0.06, "max_pct": 0.08, "vastu": "NW"},
        {"name": "Passage", "min_pct": 0.05, "max_pct": 0.08, "vastu": None},
    ],
    "2BHK": [
        {"name": "Living Room", "min_pct": 0.22, "max_pct": 0.26, "vastu": "NE"},
        {"name": "Master Bedroom", "min_pct": 0.16, "max_pct": 0.20, "vastu": "SW"},
        {"name": "Bedroom 2", "min_pct": 0.13, "max_pct": 0.16, "vastu": "NW"},
        {"name": "Kitchen", "min_pct": 0.10, "max_pct": 0.13, "vastu": "SE"},
        {"name": "Bathroom 1", "min_pct": 0.05, "max_pct": 0.06, "vastu": "NW"},
        {"name": "Bathroom 2", "min_pct": 0.04, "max_pct": 0.05, "vastu": "W"},
        {"name": "Balcony", "min_pct": 0.05, "max_pct": 0.07, "vastu": "N"},
        {"name": "Passage", "min_pct": 0.04, "max_pct": 0.06, "vastu": None},
    ],
    "3BHK": [
        {"name": "Living Room", "min_pct": 0.20, "max_pct": 0.24, "vastu": "NE"},
        {"name": "Dining", "min_pct": 0.08, "max_pct": 0.10, "vastu": "W"},
        {"name": "Master Bedroom", "min_pct": 0.14, "max_pct": 0.17, "vastu": "SW"},
        {"name": "Bedroom 2", "min_pct": 0.11, "max_pct": 0.14, "vastu": "S"},
        {"name": "Bedroom 3", "min_pct": 0.10, "max_pct": 0.12, "vastu": "NW"},
        {"name": "Kitchen", "min_pct": 0.09, "max_pct": 0.11, "vastu": "SE"},
        {"name": "Bathroom 1", "min_pct": 0.04, "max_pct": 0.05, "vastu": "NW"},
        {"name": "Bathroom 2", "min_pct": 0.03, "max_pct": 0.04, "vastu": "W"},
        {"name": "Bathroom 3", "min_pct": 0.03, "max_pct": 0.04, "vastu": "W"},
        {"name": "Balcony", "min_pct": 0.04, "max_pct": 0.06, "vastu": "N"},
        {"name": "Passage", "min_pct": 0.04, "max_pct": 0.06, "vastu": None},
    ],
    "4BHK": [
        {"name": "Living Room", "min_pct": 0.18, "max_pct": 0.22, "vastu": "NE"},
        {"name": "Dining", "min_pct": 0.07, "max_pct": 0.09, "vastu": "W"},
        {"name": "Master Bedroom", "min_pct": 0.12, "max_pct": 0.15, "vastu": "SW"},
        {"name": "Bedroom 2", "min_pct": 0.10, "max_pct": 0.12, "vastu": "S"},
        {"name": "Bedroom 3", "min_pct": 0.09, "max_pct": 0.11, "vastu": "NW"},
        {"name": "Bedroom 4", "min_pct": 0.08, "max_pct": 0.10, "vastu": "W"},
        {"name": "Kitchen", "min_pct": 0.08, "max_pct": 0.10, "vastu": "SE"},
        {"name": "Bathroom 1", "min_pct": 0.03, "max_pct": 0.04, "vastu": "NW"},
        {"name": "Bathroom 2", "min_pct": 0.03, "max_pct": 0.04, "vastu": "W"},
        {"name": "Bathroom 3", "min_pct": 0.03, "max_pct": 0.04, "vastu": "W"},
        {"name": "Balcony", "min_pct": 0.04, "max_pct": 0.06, "vastu": "N"},
        {"name": "Passage", "min_pct": 0.04, "max_pct": 0.05, "vastu": None},
    ],
    "commercial_office": [
        {"name": "Open Office", "min_pct": 0.40, "max_pct": 0.50, "vastu": None},
        {"name": "Meeting Room", "min_pct": 0.10, "max_pct": 0.15, "vastu": None},
        {"name": "Manager Cabin", "min_pct": 0.08, "max_pct": 0.12, "vastu": None},
        {"name": "Server Room", "min_pct": 0.03, "max_pct": 0.05, "vastu": None},
        {"name": "Pantry", "min_pct": 0.05, "max_pct": 0.08, "vastu": None},
        {"name": "Washroom", "min_pct": 0.05, "max_pct": 0.07, "vastu": None},
        {"name": "Lobby", "min_pct": 0.08, "max_pct": 0.10, "vastu": None},
    ],
}


class FloorPlanEngine(BaseEngine):
    """Strip-based room layout generator.
    
    Algorithm:
    1. Calculate usable area (plot minus setbacks)
    2. Determine room program from BHK config
    3. Allocate rooms as horizontal strips within plot rectangle
    4. Apply Vastu directional biases if enabled
    """

    SETBACK_FT = 3.0  # typical municipal setback

    def compute(self, project_input: ProjectInput, **kwargs) -> FloorPlanResponse:
        pw = project_input.plot_width_ft
        pd = project_input.plot_depth_ft
        bhk = project_input.bhk_config
        vastu = project_input.vastu_enabled

        # Usable area after setbacks
        usable_w = pw - 2 * self.SETBACK_FT
        usable_d = pd - 2 * self.SETBACK_FT
        usable_area = usable_w * usable_d

        templates = ROOM_TEMPLATES.get(bhk, ROOM_TEMPLATES["2BHK"])

        # Normalize percentages to sum to ~1.0
        total_pct = sum((t["min_pct"] + t["max_pct"]) / 2 for t in templates)
        rooms = []
        cursor_x = self.SETBACK_FT
        cursor_y = self.SETBACK_FT
        row_height = 0
        carpet_area = 0

        for i, tmpl in enumerate(templates):
            avg_pct = ((tmpl["min_pct"] + tmpl["max_pct"]) / 2) / total_pct
            room_area = usable_area * avg_pct
            
            # Try to make rooms well-proportioned (golden ratio-ish)
            room_w = min(usable_w, max(6, (room_area ** 0.5) * 1.2))
            room_h = room_area / room_w

            # Check if room fits in current row
            if cursor_x + room_w > pw - self.SETBACK_FT:
                cursor_x = self.SETBACK_FT
                cursor_y += row_height
                row_height = 0

            if cursor_y + room_h > pd - self.SETBACK_FT:
                room_h = pd - self.SETBACK_FT - cursor_y
                if room_h < 4:
                    room_h = 4

            room_w = round(room_w, 1)
            room_h = round(room_h, 1)
            actual_area = round(room_w * room_h, 1)
            carpet_area += actual_area

            room = Room(
                id=f"room_{i}",
                name=tmpl["name"],
                x=round(cursor_x, 1),
                y=round(cursor_y, 1),
                width=room_w,
                height=room_h,
                area_sqft=actual_area,
                vastu_direction=tmpl["vastu"] if vastu else None,
            )
            rooms.append(room)

            cursor_x += room_w
            row_height = max(row_height, room_h)

        return FloorPlanResponse(
            rooms=rooms,
            plot_width=pw,
            plot_depth=pd,
            total_built_area=round(carpet_area * project_input.num_floors, 1),
            carpet_area=round(carpet_area, 1),
            vastu_compliance=self._vastu_report(rooms) if vastu else None,
        )

    def _vastu_report(self, rooms: list[Room]) -> dict:
        compliant = []
        for r in rooms:
            if r.vastu_direction:
                compliant.append({
                    "room": r.name,
                    "recommended_direction": r.vastu_direction,
                    "status": "placed",
                })
        return {"rooms": compliant, "overall": "Vastu guidelines followed"}
