from typing import List, Dict, Any

class DebateState:
    def __init__(self, topic: str, mode: str, total_rounds: int):
        self.topic = topic
        self.mode = mode
        self.total_rounds = total_rounds
        self.current_round = 1
        self.transcript: List[Dict[str, Any]] = []
        
    def add_turn(self, round_num: int, agent: str, turn_type: str, content: str):
        self.transcript.append({
            "round": round_num,
            "agent": agent,
            "type": turn_type,
            "content": content
        })
        
    def get_transcript(self) -> List[Dict[str, Any]]:
        return self.transcript
