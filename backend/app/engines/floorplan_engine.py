"""
BuildAtlas GenAI — Floor Plan Engine
Spatial layout algorithm: zone-based strip packing with optional Vastu overrides.
All coordinates in feet from top-left plot origin.
"""

from __future__ import annotations

from app.models import FloorPlanOutput, ProjectInput, RoomRect


# ── Room configuration templates per BHK type ─────────────────────────────
_ROOM_CONFIGS: dict[str, list[dict]] = {
    "1BHK": [
        {"type": "hall",       "label": "Living Room",     "w_frac": 0.50, "h_frac": 0.40, "zone": "social"},
        {"type": "kitchen",    "label": "Kitchen",         "w_frac": 0.35, "h_frac": 0.35, "zone": "service"},
        {"type": "master_bed", "label": "Bedroom",         "w_frac": 0.55, "h_frac": 0.50, "zone": "private"},
        {"type": "bathroom",   "label": "Bathroom",        "w_frac": 0.25, "h_frac": 0.30, "zone": "service"},
        {"type": "balcony",    "label": "Balcony",         "w_frac": 0.30, "h_frac": 0.15, "zone": "social"},
    ],
    "2BHK": [
        {"type": "hall",       "label": "Living + Dining", "w_frac": 0.55, "h_frac": 0.36, "zone": "social"},
        {"type": "kitchen",    "label": "Kitchen",         "w_frac": 0.30, "h_frac": 0.28, "zone": "service"},
        {"type": "master_bed", "label": "Master Bedroom",  "w_frac": 0.50, "h_frac": 0.42, "zone": "private"},
        {"type": "bed2",       "label": "Bedroom 2",       "w_frac": 0.45, "h_frac": 0.38, "zone": "private"},
        {"type": "bath1",      "label": "Bathroom 1",      "w_frac": 0.22, "h_frac": 0.25, "zone": "service"},
        {"type": "bath2",      "label": "Bathroom 2",      "w_frac": 0.20, "h_frac": 0.22, "zone": "service"},
        {"type": "balcony",    "label": "Balcony",         "w_frac": 0.35, "h_frac": 0.12, "zone": "social"},
    ],
    "3BHK": [
        {"type": "hall",       "label": "Living Room",     "w_frac": 0.55, "h_frac": 0.36, "zone": "social"},
        {"type": "dining",     "label": "Dining Area",     "w_frac": 0.30, "h_frac": 0.28, "zone": "social"},
        {"type": "kitchen",    "label": "Kitchen",         "w_frac": 0.30, "h_frac": 0.30, "zone": "service"},
        {"type": "master_bed", "label": "Master Bedroom",  "w_frac": 0.45, "h_frac": 0.40, "zone": "private"},
        {"type": "bed2",       "label": "Bedroom 2",       "w_frac": 0.40, "h_frac": 0.35, "zone": "private"},
        {"type": "bed3",       "label": "Bedroom 3",       "w_frac": 0.35, "h_frac": 0.32, "zone": "private"},
        {"type": "bath1",      "label": "Bath (Attached)", "w_frac": 0.20, "h_frac": 0.22, "zone": "service"},
        {"type": "bath2",      "label": "Common Bath",     "w_frac": 0.18, "h_frac": 0.20, "zone": "service"},
        {"type": "utility",    "label": "Utility",         "w_frac": 0.15, "h_frac": 0.18, "zone": "service"},
        {"type": "balcony",    "label": "Balcony",         "w_frac": 0.40, "h_frac": 0.10, "zone": "social"},
    ],
}

# Vastu directional placements (compass → fraction from origin)
_VASTU_RULES: dict[str, str] = {
    "master_bed": "SW",
    "kitchen":    "SE",
    "hall":       "NE",
    "dining":     "NW",
    "bathroom":   "NW",
    "bath1":      "NW",
    "bath2":      "SE",
    "balcony":    "N",
    "utility":    "NW",
    "bed2":       "S",
    "bed3":       "W",
}

# Setbacks in feet
_SETBACKS = {"front": 1.5, "rear": 1.0, "left": 1.0, "right": 1.0}

# Minimum room sizes (sqft) for validation
_MIN_SIZES = {
    "hall": 100, "dining": 60, "kitchen": 60,
    "master_bed": 90, "bed2": 80, "bed3": 75,
    "bath1": 25, "bath2": 25, "bathroom": 25,
    "utility": 15, "balcony": 20,
}


class FloorPlanEngine:
    """Stateless floor plan layout generator using strip-packing zones."""

    def generate(self, project: ProjectInput) -> FloorPlanOutput:
        """Generate a 2D room layout for the given project."""
        ul, uw = self._usable_dimensions(project.plot_length_ft, project.plot_width_ft)
        carpet_area = ul * uw

        if carpet_area < 250:
            return FloorPlanOutput(
                plot_length_ft=project.plot_length_ft,
                plot_width_ft=project.plot_width_ft,
                usable_length=ul,
                usable_width=uw,
                carpet_area_sqft=carpet_area,
                rooms=[],
                vastu_applied=False,
                warnings=["Plot too small after setbacks — minimum 250 sqft usable area required"],
            )

        config = _ROOM_CONFIGS.get(project.bhk_type.value, _ROOM_CONFIGS["3BHK"])
        rooms = self._place_rooms(config, ul, uw)

        if project.vastu:
            rooms = self._apply_vastu(rooms, ul, uw)

        warnings = self._validate_sizes(rooms)

        return FloorPlanOutput(
            plot_length_ft=project.plot_length_ft,
            plot_width_ft=project.plot_width_ft,
            usable_length=round(ul, 1),
            usable_width=round(uw, 1),
            carpet_area_sqft=round(carpet_area, 1),
            rooms=rooms,
            vastu_applied=project.vastu,
            warnings=warnings,
        )

    # ── Internal Methods ───────────────────────────────────────────────

    @staticmethod
    def _usable_dimensions(length: float, width: float) -> tuple[float, float]:
        """Subtract setbacks from plot dimensions."""
        ul = length - _SETBACKS["left"] - _SETBACKS["right"]
        uw = width - _SETBACKS["front"] - _SETBACKS["rear"]
        return max(ul, 0), max(uw, 0)

    @staticmethod
    def _place_rooms(
        config: list[dict], usable_length: float, usable_width: float
    ) -> list[RoomRect]:
        """
        Strip-packing: divide usable area into 3 horizontal zones.
        Zone 1 (front 34%): social rooms (hall, dining, balcony)
        Zone 2 (middle 40%): private rooms (bedrooms)
        Zone 3 (rear 26%): service rooms (kitchen, bathrooms, utility)
        """
        zone_map = {"social": 0, "private": 1, "service": 2}
        zone_heights = [usable_width * 0.34, usable_width * 0.40, usable_width * 0.26]
        zone_y_starts = [
            _SETBACKS["front"],
            _SETBACKS["front"] + zone_heights[0],
            _SETBACKS["front"] + zone_heights[0] + zone_heights[1],
        ]
        zone_cursors = [_SETBACKS["left"]] * 3  # x-cursor per zone

        rooms: list[RoomRect] = []
        for rm in config:
            zone_idx = zone_map.get(rm["zone"], 0)
            zh = zone_heights[zone_idx]
            y0 = zone_y_starts[zone_idx]

            rw = usable_length * rm["w_frac"]
            rh = zh * rm["h_frac"] / 0.4  # normalise fraction to zone height

            # Clamp to zone boundaries
            rh = min(rh, zh)
            if zone_cursors[zone_idx] + rw > _SETBACKS["left"] + usable_length:
                # Wrap to next row in same zone (simplified: just shrink)
                rw = _SETBACKS["left"] + usable_length - zone_cursors[zone_idx]

            area = rw * rh
            rooms.append(
                RoomRect(
                    room_type=rm["type"],
                    label=rm["label"],
                    x=round(zone_cursors[zone_idx], 1),
                    y=round(y0, 1),
                    width=round(rw, 1),
                    height=round(rh, 1),
                    area_sqft=round(area, 1),
                    zone=rm["zone"],
                    vastu_direction=None,
                )
            )
            zone_cursors[zone_idx] += rw

        return rooms

    @staticmethod
    def _apply_vastu(rooms: list[RoomRect], ul: float, uw: float) -> list[RoomRect]:
        """Reposition rooms to match Vastu compass directions."""
        direction_coords: dict[str, tuple[float, float]] = {
            "NE": (_SETBACKS["left"], _SETBACKS["front"]),
            "NW": (_SETBACKS["left"] + ul * 0.55, _SETBACKS["front"]),
            "SE": (_SETBACKS["left"], _SETBACKS["front"] + uw * 0.60),
            "SW": (_SETBACKS["left"] + ul * 0.55, _SETBACKS["front"] + uw * 0.60),
            "N":  (_SETBACKS["left"] + ul * 0.30, _SETBACKS["front"]),
            "S":  (_SETBACKS["left"] + ul * 0.30, _SETBACKS["front"] + uw * 0.70),
            "E":  (_SETBACKS["left"], _SETBACKS["front"] + uw * 0.35),
            "W":  (_SETBACKS["left"] + ul * 0.60, _SETBACKS["front"] + uw * 0.35),
        }

        updated: list[RoomRect] = []
        used_directions: set[str] = set()

        for room in rooms:
            direction = _VASTU_RULES.get(room.room_type)
            if direction and direction not in used_directions:
                coords = direction_coords.get(direction, (room.x, room.y))
                used_directions.add(direction)
                updated.append(
                    room.model_copy(
                        update={"x": round(coords[0], 1), "y": round(coords[1], 1), "vastu_direction": direction}
                    )
                )
            else:
                updated.append(room)

        return updated

    @staticmethod
    def _validate_sizes(rooms: list[RoomRect]) -> list[str]:
        """Check rooms against minimum size requirements."""
        warnings: list[str] = []
        for room in rooms:
            min_size = _MIN_SIZES.get(room.room_type, 0)
            if room.area_sqft < min_size:
                warnings.append(
                    f"{room.label} is {room.area_sqft:.0f} sqft — below minimum {min_size} sqft"
                )
        return warnings
