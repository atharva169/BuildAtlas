"""Cascade Engine — DAG forward-pass for delay propagation."""
from backend.engines.base import BaseEngine
from backend.models.schemas import (
    ProjectInput, CascadeResponse, CascadeEffect, ScheduleResponse
)


class CascadeEngine(BaseEngine):
    """DAG-based delay cascade predictor."""

    def compute(self, project_input: ProjectInput = None,
                schedule: ScheduleResponse = None,
                delayed_phase_id: str = "foundation",
                delay_days: int = 14, **kwargs) -> CascadeResponse:
        if not schedule:
            return CascadeResponse(
                delayed_phase="", delay_days=0, affected_phases=[],
                new_total_days=0, original_total_days=0,
            )

        phases = {p.id: p for p in schedule.phases}
        original_total = schedule.total_duration_days

        # Build adjacency list
        dependents = {}  # phase_id → [phases that depend on it]
        for p in schedule.phases:
            for dep in p.dependencies:
                dependents.setdefault(dep, []).append(p.id)

        # Forward pass from delayed phase
        new_ends = {p.id: p.end_day for p in schedule.phases}
        
        # Apply initial delay
        if delayed_phase_id in phases:
            original_end = phases[delayed_phase_id].end_day
            new_ends[delayed_phase_id] = original_end + delay_days

        # Propagate through DAG
        visited = set()
        queue = [delayed_phase_id]

        while queue:
            current = queue.pop(0)
            if current in visited:
                continue
            visited.add(current)

            for child_id in dependents.get(current, []):
                child = phases.get(child_id)
                if not child:
                    continue
                
                # New start = max of all dependency end times
                new_start = max(new_ends.get(dep, 0) for dep in child.dependencies)
                new_end = new_start + child.duration_days
                
                if new_end > new_ends[child_id]:
                    new_ends[child_id] = new_end
                    queue.append(child_id)

        # Build affected phases list
        affected = []
        for p in schedule.phases:
            if new_ends[p.id] != p.end_day:
                affected.append(CascadeEffect(
                    phase_id=p.id,
                    phase_name=p.name,
                    original_end=p.end_day,
                    new_end=new_ends[p.id],
                    delay_days=new_ends[p.id] - p.end_day,
                    is_critical=p.is_critical,
                ))

        new_total = max(new_ends.values()) if new_ends else original_total

        return CascadeResponse(
            delayed_phase=delayed_phase_id,
            delay_days=delay_days,
            affected_phases=affected,
            new_total_days=new_total,
            original_total_days=original_total,
        )
