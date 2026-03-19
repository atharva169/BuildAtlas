"""
BuildAtlas GenAI — Mock Data Package
Complete Indian construction reference data including CPWD DSR 2023 rates,
city multipliers, labour rates, monsoon calendar, approval TATs, and materials.
"""

# ---------------------------------------------------------------------------
# CPWD DSR 2023 Rates — 15 Common Line Items
# ---------------------------------------------------------------------------
CPWD_DSR_RATES = [
    {"code": "2.22",  "desc": "Excavation in ordinary soil (0–1.5m depth)",              "unit": "cum",   "rate": 254.00,  "category": "earthwork"},
    {"code": "4.1.8", "desc": "PCC M15 in foundation (1:2:4 nominal mix)",               "unit": "cum",   "rate": 5765.00, "category": "concrete"},
    {"code": "5.3.2", "desc": "RCC M25 in slab/beam/column (design mix)",                "unit": "cum",   "rate": 8240.50, "category": "concrete"},
    {"code": "5.9",   "desc": "Steel reinforcement Fe-500D (TMT bars)",                  "unit": "kg",    "rate": 74.50,   "category": "steel"},
    {"code": "6.1",   "desc": "Brick masonry (230mm) in CM 1:4",                         "unit": "cum",   "rate": 6385.00, "category": "masonry"},
    {"code": "6.27",  "desc": "AAC Block masonry (200mm) in CM 1:4",                     "unit": "cum",   "rate": 5480.00, "category": "masonry"},
    {"code": "13.1",  "desc": "12mm cement plaster (1:4) internal wall",                 "unit": "sqm",   "rate": 258.00,  "category": "plaster"},
    {"code": "13.10", "desc": "15mm cement plaster (1:4) external wall",                 "unit": "sqm",   "rate": 312.00,  "category": "plaster"},
    {"code": "11.1",  "desc": "Vitrified tile flooring (600×600mm)",                     "unit": "sqm",   "rate": 1420.00, "category": "flooring"},
    {"code": "11.42", "desc": "Polished granite flooring (18mm thick)",                  "unit": "sqm",   "rate": 2850.00, "category": "flooring"},
    {"code": "13.62", "desc": "Acrylic emulsion paint (2 coats over primer)",            "unit": "sqm",   "rate": 78.50,   "category": "painting"},
    {"code": "9.85",  "desc": "Flush door shutter (35mm) with hardware",                 "unit": "each",  "rate": 8450.00, "category": "joinery"},
    {"code": "9.102", "desc": "UPVC window with 5mm glass (std size)",                   "unit": "sqm",   "rate": 5640.00, "category": "joinery"},
    {"code": "18.1",  "desc": "CPVC plumbing (15mm pipe + fittings per point)",          "unit": "point", "rate": 1350.00, "category": "plumbing"},
    {"code": "18.75", "desc": "Electrical point (copper wiring, switch, socket)",        "unit": "point", "rate": 1180.00, "category": "electrical"},
]

# ---------------------------------------------------------------------------
# City-Level Base Rates (₹ per sqft for G+1, standard grade)
# ---------------------------------------------------------------------------
CITY_RATES: dict[str, dict[str, float]] = {
    "Bengaluru":  {"residential": 2100.0, "commercial": 2800.0},
    "Delhi NCR":  {"residential": 2400.0, "commercial": 3200.0},
    "Mumbai":     {"residential": 2650.0, "commercial": 3500.0},
    "Pune":       {"residential": 1950.0, "commercial": 2600.0},
    "Hyderabad":  {"residential": 1850.0, "commercial": 2450.0},
    "Chennai":    {"residential": 2000.0, "commercial": 2650.0},
    "Ahmedabad":  {"residential": 1700.0, "commercial": 2250.0},
    "Kolkata":    {"residential": 1600.0, "commercial": 2100.0},
    "Tier-2":     {"residential": 1450.0, "commercial": 1900.0},
}

# ---------------------------------------------------------------------------
# City Multipliers (base = Delhi NCR = 1.00)
# ---------------------------------------------------------------------------
CITY_MULTIPLIERS: dict[str, float] = {
    "Bengaluru": 1.12, "Mumbai": 1.25, "Delhi NCR": 1.00,
    "Chennai": 0.98, "Hyderabad": 1.05, "Pune": 1.08,
    "Kolkata": 0.90, "Ahmedabad": 0.92, "Tier-2": 0.82,
}

# ---------------------------------------------------------------------------
# City → State Mapping (for labour rates and monsoon data)
# ---------------------------------------------------------------------------
CITY_TO_STATE: dict[str, str] = {
    "Bengaluru": "KA", "Mumbai": "MH", "Pune": "MH",
    "Delhi NCR": "DL", "Chennai": "TN", "Hyderabad": "TS",
    "Kolkata": "WB", "Ahmedabad": "GJ",
}

# ---------------------------------------------------------------------------
# Labour Rate Tables (daily wages in ₹ by state)
# ---------------------------------------------------------------------------
LABOUR_RATES: dict[str, dict[str, float]] = {
    "KA": {"mason": 950, "helper": 550, "carpenter": 900, "plumber": 850, "electrician": 800, "painter": 750, "bar_bender": 850},
    "MH": {"mason": 1050, "helper": 600, "carpenter": 1000, "plumber": 950, "electrician": 900, "painter": 800, "bar_bender": 950},
    "DL": {"mason": 900, "helper": 500, "carpenter": 850, "plumber": 800, "electrician": 750, "painter": 700, "bar_bender": 800},
    "TN": {"mason": 850, "helper": 500, "carpenter": 800, "plumber": 750, "electrician": 700, "painter": 650, "bar_bender": 750},
    "TS": {"mason": 900, "helper": 520, "carpenter": 850, "plumber": 800, "electrician": 750, "painter": 700, "bar_bender": 800},
    "WB": {"mason": 750, "helper": 450, "carpenter": 700, "plumber": 650, "electrician": 600, "painter": 550, "bar_bender": 650},
    "GJ": {"mason": 800, "helper": 480, "carpenter": 750, "plumber": 700, "electrician": 650, "painter": 600, "bar_bender": 700},
}

# ---------------------------------------------------------------------------
# Monsoon Calendar (state → lockout month numbers)
# ---------------------------------------------------------------------------
MONSOON_MONTHS: dict[str, list[int]] = {
    "KA": [6, 7, 8, 9],
    "MH": [6, 7, 8, 9],
    "DL": [7, 8, 9],
    "TN": [10, 11],
    "TS": [6, 7, 8, 9],
    "WB": [6, 7, 8, 9],
    "GJ": [6, 7, 8],
}

# ---------------------------------------------------------------------------
# Approval TAT Registry (authority → days)
# ---------------------------------------------------------------------------
APPROVAL_TATS: dict[str, int] = {
    "BBMP": 45,
    "BDA": 60,
    "RERA": 30,
    "CLRA": 21,
    "Municipal": 30,
    "BMC": 90,
    "DDA": 60,
    "CMDA": 45,
    "GHMC": 40,
    "PMC": 50,
    "KMC": 45,
    "AMC": 40,
}

# City → primary approval authority
CITY_APPROVALS: dict[str, list[str]] = {
    "Bengaluru": ["BBMP", "RERA"],
    "Mumbai":    ["BMC", "RERA"],
    "Delhi NCR": ["DDA", "RERA"],
    "Chennai":   ["CMDA", "RERA"],
    "Hyderabad": ["GHMC", "RERA"],
    "Pune":      ["PMC", "RERA"],
    "Kolkata":   ["KMC", "RERA"],
    "Ahmedabad": ["AMC", "RERA"],
}

# ---------------------------------------------------------------------------
# Material Specification Table — 10 Materials with IS Code References
# ---------------------------------------------------------------------------
MATERIALS: dict[str, list[dict]] = {
    "masonry": [
        {"id": "m1", "name": "Red Clay Brick (Class A)", "is_code": "IS 1077:1992", "unit": "per 1000",  "base_cost": 7500,  "time_delta_weeks": 0,    "strength_pct": 85,  "thermal_score": 55, "availability_pct": 95, "is_baseline": True},
        {"id": "m2", "name": "AAC Block (600×200×200mm)", "is_code": "IS 2185-P1",  "unit": "per m³",    "base_cost": 6600,  "time_delta_weeks": -1.5, "strength_pct": 82,  "thermal_score": 80, "availability_pct": 85, "is_baseline": False},
        {"id": "m3", "name": "Fly Ash Brick",             "is_code": "IS 12894:2002","unit": "per 1000",  "base_cost": 5800,  "time_delta_weeks": 0,    "strength_pct": 80,  "thermal_score": 65, "availability_pct": 90, "is_baseline": False},
        {"id": "m4", "name": "Hollow Concrete Block",     "is_code": "IS 2185-P1",  "unit": "per 100",   "base_cost": 4200,  "time_delta_weeks": -1,   "strength_pct": 78,  "thermal_score": 60, "availability_pct": 80, "is_baseline": False},
    ],
    "cement": [
        {"id": "m5", "name": "OPC 53-Grade Cement",   "is_code": "IS 12269:2013", "unit": "bag (50kg)", "base_cost": 380, "time_delta_weeks": 0,   "strength_pct": 100, "thermal_score": 0, "availability_pct": 95, "is_baseline": True},
        {"id": "m6", "name": "PPC Cement",             "is_code": "IS 1489:1991",  "unit": "bag (50kg)", "base_cost": 350, "time_delta_weeks": 0.5, "strength_pct": 92,  "thermal_score": 0, "availability_pct": 98, "is_baseline": False},
    ],
    "steel": [
        {"id": "m7", "name": "TMT Fe-500D Rebar",  "is_code": "IS 1786:2008", "unit": "kg",  "base_cost": 62, "time_delta_weeks": 0,  "strength_pct": 100, "thermal_score": 0, "availability_pct": 95, "is_baseline": True},
        {"id": "m8", "name": "TMT Fe-415 Rebar",   "is_code": "IS 1786:2008", "unit": "kg",  "base_cost": 58, "time_delta_weeks": 0,  "strength_pct": 83,  "thermal_score": 0, "availability_pct": 98, "is_baseline": False},
    ],
    "roofing": [
        {"id": "m9",  "name": "RCC Flat Slab (M25)",  "is_code": "IS 456:2000",  "unit": "sqm", "base_cost": 2800, "time_delta_weeks": 0,   "strength_pct": 100, "thermal_score": 40, "availability_pct": 100, "is_baseline": True},
        {"id": "m10", "name": "Filler Slab (Clay pot)","is_code": "IS 456:2000",  "unit": "sqm", "base_cost": 2200, "time_delta_weeks": 0.5, "strength_pct": 85,  "thermal_score": 70, "availability_pct": 70,  "is_baseline": False},
    ],
}

# ---------------------------------------------------------------------------
# Quality Tier Multipliers
# ---------------------------------------------------------------------------
QUALITY_MULTIPLIERS: dict[str, dict] = {
    "economy":  {"rate_multiplier": 0.82, "sqft_efficiency": 13.0, "time_multiplier": 1.0,  "label": "Economy",  "desc": "Load-bearing structure, clay bricks, basic finishes"},
    "standard": {"rate_multiplier": 1.00, "sqft_efficiency": 10.0, "time_multiplier": 1.15, "label": "Standard", "desc": "RCC frame, AAC blocks, vitrified tiles, standard fittings"},
    "premium":  {"rate_multiplier": 1.28, "sqft_efficiency": 7.5,  "time_multiplier": 1.35, "label": "Premium",  "desc": "Premium finishes, UPVC windows, premium sanitary ware"},
    "luxury":   {"rate_multiplier": 1.65, "sqft_efficiency": 5.5,  "time_multiplier": 1.50, "label": "Luxury",   "desc": "Imported marble, VRV HVAC, home automation, designer fittings"},
}

# ---------------------------------------------------------------------------
# BOQ Component Breakdown (percentage of total civil cost)
# ---------------------------------------------------------------------------
BOQ_COMPONENTS: dict[str, float] = {
    "Civil & Structure":  0.42,
    "Finishes & Interior": 0.24,
    "MEP (Electrical + Plumbing)": 0.18,
    "Labour":             0.10,
    "Contingency":        0.06,
}

# ---------------------------------------------------------------------------
# Compliance Checklist Templates
# ---------------------------------------------------------------------------
COMPLIANCE_CHECKLIST: dict[str, list[dict]] = {
    "RERA": [
        {"item": "RERA Registration obtained before advertisement", "mandatory": True, "ref": "RERA Act 2016 Sec. 3"},
        {"item": "Quarterly progress update filed", "mandatory": True, "ref": "RERA Act 2016 Sec. 11"},
        {"item": "70% of collected amount in escrow account", "mandatory": True, "ref": "RERA Act 2016 Sec. 4(2)(l)(D)"},
        {"item": "Structural completion certificate from engineer", "mandatory": True, "ref": "RERA Act 2016 Sec. 14"},
        {"item": "Occupancy Certificate applied after completion", "mandatory": True, "ref": "RERA Act 2016 Sec. 11(4)(b)"},
    ],
    "BBMP": [
        {"item": "Plan sanction from designated authority", "mandatory": True, "ref": "KPBA 1961 Sec. 13"},
        {"item": "Commencement Certificate obtained", "mandatory": True, "ref": "BBMP BLD Bylaws 2020 Cl. 8"},
        {"item": "Setback compliance as per zonal plan", "mandatory": True, "ref": "KPBA Zoning Regulations"},
        {"item": "Fire NOC for buildings > 15m height", "mandatory": True, "ref": "NBC 2016 Part 4"},
        {"item": "Structural stability certificate", "mandatory": True, "ref": "KPBA 1961 Sec. 14A"},
    ],
    "CLRA": [
        {"item": "Contractor registration under CLRA", "mandatory": True, "ref": "CLRA 1970 Sec. 7"},
        {"item": "Principal employer registration", "mandatory": True, "ref": "CLRA 1970 Sec. 7(1)"},
        {"item": "Worker welfare provisions maintained", "mandatory": True, "ref": "CLRA 1970 Sec. 16-28"},
    ],
    "IS_CODES": [
        {"item": "Concrete mix design as per IS 10262:2019", "mandatory": True, "ref": "IS 10262:2019"},
        {"item": "RCC detailing as per IS 456:2000", "mandatory": True, "ref": "IS 456:2000 Cl. 26"},
        {"item": "Seismic zone compliance IS 1893:2016", "mandatory": True, "ref": "IS 1893:2016 Part 1"},
        {"item": "Steel quality IS 1786:2008", "mandatory": True, "ref": "IS 1786:2008"},
    ],
}

# ---------------------------------------------------------------------------
# 3 Pre-Built Example Projects
# ---------------------------------------------------------------------------
EXAMPLE_PROJECTS = [
    {
        "name": "Sai Krupa Residency",
        "city": "Bengaluru", "project_type": "residential", "floors": 3,
        "plot_length_ft": 40, "plot_width_ft": 60, "builtup_sqft": 5400,
        "quality": "standard", "vastu": True, "start_month": 1, "start_year": 2025,
        "soil": "medium", "bhk_type": "3BHK",
        "expected_cost_lakhs": 95, "expected_months": 14,
    },
    {
        "name": "Marine Heights",
        "city": "Mumbai", "project_type": "residential", "floors": 5,
        "plot_length_ft": 50, "plot_width_ft": 80, "builtup_sqft": 12000,
        "quality": "premium", "vastu": False, "start_month": 3, "start_year": 2025,
        "soil": "soft",  "bhk_type": "3BHK",
        "expected_cost_lakhs": 380, "expected_months": 22,
    },
    {
        "name": "Tech Park Annex",
        "city": "Hyderabad", "project_type": "commercial", "floors": 4,
        "plot_length_ft": 60, "plot_width_ft": 100, "builtup_sqft": 18000,
        "quality": "standard", "vastu": False, "start_month": 10, "start_year": 2025,
        "soil": "hard_rock", "bhk_type": "3BHK",
        "expected_cost_lakhs": 280, "expected_months": 18,
    },
]

# ---------------------------------------------------------------------------
# Resource Templates — Crew by Phase
# ---------------------------------------------------------------------------
CREW_TEMPLATES: dict[str, dict] = {
    "Excavation & Foundation": {
        "mason": 4, "helper": 8, "bar_bender": 2, "carpenter": 2,
        "equipment": ["JCB Backhoe", "Transit Mixer"],
    },
    "Superstructure RCC": {
        "mason": 6, "helper": 12, "bar_bender": 4, "carpenter": 4,
        "equipment": ["Tower Crane", "Concrete Pump", "Transit Mixer", "Vibrator"],
    },
    "Masonry & Plastering": {
        "mason": 8, "helper": 10, "carpenter": 1,
        "equipment": ["Scaffolding", "Mortar Mixer"],
    },
    "MEP Rough-in": {
        "plumber": 4, "electrician": 4, "helper": 4,
        "equipment": ["Pipe Threading Machine", "Cable Pulling Kit"],
    },
    "Finishes & Handover": {
        "mason": 4, "helper": 6, "painter": 4, "carpenter": 2, "plumber": 2, "electrician": 2,
        "equipment": ["Scaffolding", "Tile Cutter"],
    },
}
