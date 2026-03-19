"""BaseEngine abstract class — all engines implement compute()."""
from abc import ABC, abstractmethod
from pydantic import BaseModel


class BaseEngine(ABC):
    """Engines are stateless — data is injected via DataStore."""

    def __init__(self, data_store):
        self.data = data_store

    @abstractmethod
    def compute(self, project_input, **kwargs) -> BaseModel:
        """Pure computation. No LLM. No I/O. Deterministic."""
        ...
