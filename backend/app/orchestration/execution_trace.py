from typing import List, Dict, Any

class ExecutionTrace:
    def __init__(self):
        self.trace: List[Dict[str, str]] = []
        
    def add_step(self, agent: str, status: str, message: str):
        self.trace.append({
            "agent": agent,
            "status": status,
            "message": message
        })
        
    def get_trace(self) -> List[Dict[str, str]]:
        return self.trace
