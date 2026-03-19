"""
BuildAtlas GenAI — Schedule Engine
CPM-based schedule generator with monsoon lockout, approval TATs, and delay cascade.
All dates are ISO-8601 strings.  Durations are in weeks.
"""

from __future__ import annotations

import math
from collections import defaultdict, deque
from datetime import date, timedelta
from typing import Optional

from app.data.mock_data import (
    APPROVAL_TATS,
    CITY_APPROVALS,
    CITY_TO_STATE,
    MONSOON_MONTHS,
)
from app.models import (
    CascadePhaseResult,
    DelayCascadeInput,
    DelayCascadeResult,
    PhaseItem,
    ProjectInput,
    ScheduleOutput,
)


# ── Phase Template ─────────────────────────────────────────────────────────
_PHASE_TEMPLATES: list[dict] = [
    {"name": "Excavation & Foundation",  "base_weeks": 6,  "depends_on": [],     "outdoor": True},
    {"name": "Superstructure RCC",       "base_weeks": 10, "depends_on": [0],     "outdoor": True},
    {"name": "Masonry & Plastering",     "base_weeks": 8,  "depends_on": [1],     "outdoor": False},
    {"name": "MEP Rough-in",            "base_weeks": 6,  "depends_on": [1],     "outdoor": False},
    {"name": "Finishes & Handover",     "base_weeks": 10, "depends_on": [2, 3],  "outdoor": False},
]


class ScheduleEngine:
    """Stateless CPM-based schedule generation with Indian construction context."""

    # ── Public API ─────────────────────────────────────────────────────

    def generate(self, project: ProjectInput) -> ScheduleOutput:
        """Build a full schedule with monsoon lockout and approval embeds."""
        state = CITY_TO_STATE.get(project.city, "")
        start = date(project.start_year, project.start_month, 1)

        # Build phases with floor-adjusted durations
        phases = self._build_phases(project.floors)

        # Embed approval wait at the front
        approval_weeks = self._approval_weeks(project.city)

        # Apply monsoon lockout to outdoor phases
        monsoon_weeks = self._apply_monsoon_lockout(phases, state, start)

        # Forward-pass scheduling
        self._forward_pass(phases, start, approval_weeks)

        # Identify critical path
        critical = self._critical_path(phases)
        for idx in critical:
            phases[idx]["is_critical"] = True

        # Convert to output models
        phase_items = self._to_phase_items(phases)
        project_end = max(p.end_date for p in phase_items)
        total_weeks = sum(p.adjusted_weeks for p in phase_items)

        return ScheduleOutput(
            project_start=start.isoformat(),
            project_end=project_end,
            total_weeks=total_weeks,
            total_months=round(total_weeks / 4.33, 1),
            phases=phase_items,
            critical_path_indices=critical,
            monsoon_lockout_weeks=monsoon_weeks,
            approval_wait_weeks=approval_weeks,
        )

    def cascade(
        self, project: ProjectInput, schedule: ScheduleOutput, inp: DelayCascadeInput
    ) -> DelayCascadeResult:
        """Simulate a delay in one phase and propagate through the DAG."""
        phases = [p.model_dump() for p in schedule.phases]
        delay_days = inp.delay_weeks * 7
        trigger_idx = inp.delayed_phase_index

        if trigger_idx < 0 or trigger_idx >= len(phases):
            raise ValueError(f"Phase index {trigger_idx} out of range")

        # Build successors adjacency
        successors: dict[int, list[int]] = defaultdict(list)
        for p in phases:
            for dep in p["depends_on"]:
                successors[dep].append(p["index"])

        # Shift trigger
        orig_end = phases[trigger_idx]["end_date"]
        new_trigger_end = (
            date.fromisoformat(orig_end) + timedelta(days=delay_days)
        ).isoformat()
        phases[trigger_idx]["end_date"] = new_trigger_end

        # BFS forward propagation
        affected: list[CascadePhaseResult] = []
        queue: deque[int] = deque(successors[trigger_idx])
        visited: set[int] = {trigger_idx}

        affected.append(
            CascadePhaseResult(
                index=trigger_idx,
                name=phases[trigger_idx]["name"],
                original_end=orig_end,
                new_end=new_trigger_end,
                delay_days=delay_days,
                status="BLOCKED",
            )
        )

        while queue:
            idx = queue.popleft()
            if idx in visited:
                continue
            visited.add(idx)
            phase = phases[idx]

            # New earliest start = max end-date of all predecessors
            pred_ends = [
                date.fromisoformat(phases[d]["end_date"]) for d in phase["depends_on"]
            ]
            new_es = max(pred_ends) if pred_ends else date.fromisoformat(phase["start_date"])
            old_start = date.fromisoformat(phase["start_date"])
            shift = (new_es - old_start).days

            if shift > 0:
                new_start = new_es
                dur = (
                    date.fromisoformat(phase["end_date"])
                    - date.fromisoformat(phase["start_date"])
                ).days
                new_end = new_start + timedelta(days=dur)
                phases[idx]["start_date"] = new_start.isoformat()
                phases[idx]["end_date"] = new_end.isoformat()

                status = "BLOCKED" if trigger_idx in phase["depends_on"] else "PARTIAL"
                affected.append(
                    CascadePhaseResult(
                        index=idx,
                        name=phase["name"],
                        original_end=(new_end - timedelta(days=shift)).isoformat(),
                        new_end=new_end.isoformat(),
                        delay_days=shift,
                        status=status,
                    )
                )
                queue.extend(successors[idx])
            else:
                affected.append(
                    CascadePhaseResult(
                        index=idx,
                        name=phase["name"],
                        original_end=phase["end_date"],
                        new_end=phase["end_date"],
                        delay_days=0,
                        status="FREE",
                    )
                )

        new_project_end = max(date.fromisoformat(p["end_date"]) for p in phases)
        old_project_end = date.fromisoformat(schedule.project_end)
        total_delay = (new_project_end - old_project_end).days

        # Cost impact: rough ₹0.05 lakh per delay-day (site overhead)
        cost_impact = max(0, total_delay) * 0.05

        return DelayCascadeResult(
            trigger_phase=phases[trigger_idx]["name"],
            delay_weeks=inp.delay_weeks,
            affected_phases=affected,
            original_project_end=schedule.project_end,
            new_project_end=new_project_end.isoformat(),
            total_delay_days=max(0, total_delay),
            cost_impact_lakhs=round(cost_impact, 2),
        )

    # ── Internal Methods ───────────────────────────────────────────────

    def _build_phases(self, floors: int) -> list[dict]:
        """Create phase list with floor-adjusted durations."""
        floor_factor = 1.0 + max(0, floors - 2) * 0.18  # each floor above G+1 adds 18%
        phases = []
        for i, tpl in enumerate(_PHASE_TEMPLATES):
            adj = tpl["base_weeks"]
            if tpl["name"] in ("Superstructure RCC", "Masonry & Plastering"):
                adj = math.ceil(tpl["base_weeks"] * floor_factor)
            phases.append({
                "index": i,
                "name": tpl["name"],
                "base_weeks": tpl["base_weeks"],
                "adjusted_weeks": adj,
                "depends_on": list(tpl["depends_on"]),
                "outdoor": tpl["outdoor"],
                "is_critical": False,
                "monsoon_delay_weeks": 0,
                "status": "FREE",
            })
        return phases

    @staticmethod
    def _approval_weeks(city: str) -> int:
        """Sum approval TATs for the city's authorities, converted to weeks."""
        authorities = CITY_APPROVALS.get(city, ["Municipal", "RERA"])
        total_days = sum(APPROVAL_TATS.get(a, 30) for a in authorities)
        return math.ceil(total_days / 7.0)

    @staticmethod
    def _apply_monsoon_lockout(phases: list[dict], state: str, start: date) -> int:
        """Add monsoon buffer weeks to outdoor phases if they overlap lockout months."""
        monsoon = MONSOON_MONTHS.get(state, [])
        if not monsoon:
            return 0

        total_monsoon_weeks = 0
        cursor = start
        for phase in phases:
            phase_weeks = phase["adjusted_weeks"]
            phase_end = cursor + timedelta(weeks=phase_weeks)

            if phase["outdoor"]:
                overlap_weeks = 0
                check = cursor
                while check < phase_end:
                    if check.month in monsoon:
                        overlap_weeks += 1
                    check += timedelta(weeks=1)

                if overlap_weeks > 0:
                    buffer = math.ceil(overlap_weeks * 0.6)  # 60% productivity loss
                    phase["adjusted_weeks"] += buffer
                    phase["monsoon_delay_weeks"] = buffer
                    total_monsoon_weeks += buffer
                    phase_end = cursor + timedelta(weeks=phase["adjusted_weeks"])

            cursor = phase_end

        return total_monsoon_weeks

    @staticmethod
    def _forward_pass(phases: list[dict], start: date, approval_weeks: int) -> None:
        """CPM forward-pass: set start_date and end_date for each phase."""
        approval_end = start + timedelta(weeks=approval_weeks)

        for phase in phases:
            if not phase["depends_on"]:
                phase["start_date"] = approval_end.isoformat()
            else:
                latest_pred_end = max(
                    date.fromisoformat(phases[d]["end_date"]) for d in phase["depends_on"]
                )
                phase["start_date"] = latest_pred_end.isoformat()

            s = date.fromisoformat(phase["start_date"])
            phase["end_date"] = (s + timedelta(weeks=phase["adjusted_weeks"])).isoformat()

    @staticmethod
    def _critical_path(phases: list[dict]) -> list[int]:
        """Identify the longest (critical) path through the DAG."""
        n = len(phases)
        dist = [0] * n
        parent = [-1] * n

        for i in range(n):
            for dep in phases[i]["depends_on"]:
                candidate = dist[dep] + phases[i]["adjusted_weeks"]
                if candidate > dist[i]:
                    dist[i] = candidate
                    parent[i] = dep

        # Trace back from the node with the longest distance
        end_idx = max(range(n), key=lambda x: dist[x])
        path = []
        cur: Optional[int] = end_idx
        while cur is not None and cur != -1:
            path.append(cur)
            cur = parent[cur]
        path.reverse()

        # Always include the last phase if not already there
        last_idx = n - 1
        if last_idx not in path:
            path.append(last_idx)

        return path

    @staticmethod
    def _to_phase_items(phases: list[dict]) -> list[PhaseItem]:
        """Convert internal dicts to PhaseItem models."""
        return [
            PhaseItem(
                index=p["index"],
                name=p["name"],
                base_weeks=p["base_weeks"],
                adjusted_weeks=p["adjusted_weeks"],
                start_date=p["start_date"],
                end_date=p["end_date"],
                depends_on=p["depends_on"],
                is_outdoor=p["outdoor"],
                is_critical=p["is_critical"],
                monsoon_delay_weeks=p["monsoon_delay_weeks"],
                status=p["status"],
            )
            for p in phases
        ]
