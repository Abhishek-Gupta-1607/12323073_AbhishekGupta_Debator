from app.agents.base_agent import BaseAgent
from app.schemas.verdict import JudgeVerdict
from typing import List, Dict, Any
from app.config import settings

JUDGE_SYSTEM_PROMPT = """You are a dedicated neutral JUDGE in a formal debate.
You must not argue for either side. You evaluate argument quality rather than whether you personally agree with the proposition.

Evaluation criteria (0-10 each):
1. Logical reasoning
2. Relevance
3. Evidence quality
4. Counterargument quality
5. Internal consistency
6. Practical reasoning
7. Clarity
8. Responsiveness to opponent

You will receive the debate topic and the full transcript.
You must return a structured JSON evaluation.
Scores for 'for_score' and 'against_score' must be exactly out of 100 (e.g. sum of criteria or similar logic).
'winner' must be one of: "FOR", "AGAINST", "DRAW".
"""

class JudgeAgent(BaseAgent):
    def __init__(self):
        super().__init__(role="JUDGE", system_prompt=JUDGE_SYSTEM_PROMPT, model=settings.JUDGE_MODEL_NAME)
        
    async def evaluate(self, topic: str, transcript: List[Dict[str, Any]]) -> JudgeVerdict:
        prompt = f"Please evaluate the debate on the topic: '{topic}' based on the provided transcript."
        return await self.generate_structured_response(prompt, transcript, JudgeVerdict)
