"""DataStore — loads and caches all JSON data at startup."""
import json
from functools import lru_cache
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"


class DataStore:
    """Loaded once at startup, ~2 MB total, cached via lru_cache."""

    def __init__(self):
        self.cpwd_dsr = self._load("cpwd_dsr.json")
        self.city_rates = self._load("city_rates.json")
        self.monsoon_calendar = self._load("monsoon_calendar.json")
        self.compliance_rules = self._load("compliance_rules.json")
        self.materials_db = self._load("materials_db.json")
        self.labour_rates = self._load("labour_rates.json")

    def _load(self, filename: str) -> dict:
        with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
            return json.load(f)

    # ── Lookup helpers ──
    def get_city_multiplier(self, city: str, category: str) -> float:
        city_data = self.city_rates.get(city.lower(), {})
        return city_data.get(category, 1.0)

    def get_state_for_city(self, city: str) -> str:
        city_data = self.city_rates.get(city.lower(), {})
        return city_data.get("state", "karnataka")

    def get_monsoon_lockout(self, state: str) -> dict:
        return self.monsoon_calendar.get(state.lower(), {
            "start_month": 6, "end_month": 9,
            "severity": "moderate", "outdoor_lockout_pct": 0.5
        })

    def get_material_rate(self, material_key: str) -> dict:
        return self.cpwd_dsr.get("materials", {}).get(material_key, {})

    def get_quantity_norm(self, building_type: str, material_key: str) -> dict:
        return self.cpwd_dsr.get("quantity_norms", {}).get(
            building_type, {}
        ).get(material_key, {})

    def get_labour_rates(self, state: str) -> dict:
        return self.labour_rates.get(state.lower(), self.labour_rates.get("karnataka", {}))


@lru_cache()
def get_data_store() -> DataStore:
    return DataStore()
