from abc import ABC, abstractmethod

class BaseAgent(ABC):
    @abstractmethod
    def run(self, project_id: str, context: dict, prompt: str):
        pass
