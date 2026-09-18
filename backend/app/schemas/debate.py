from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from app.schemas.verdict import JudgeVerdict
from datetime import datetime

class DebateRequest(BaseModel):
    topic: str = Field(..., min_length=10, max_length=500)
    mode: str = Field(..., pattern="^(quick|full)$")
    rounds: int = Field(..., ge=1, le=4)

class DebateTurn(BaseModel):
    round: int
    agent: str
    type: str
    content: str
    
class ExecutionTraceItem(BaseModel):
    agent: str
    status: str
    message: str

class DebateResponse(BaseModel):
    debate_id: int
    topic: str
    mode: str
    rounds: int
    transcript: List[DebateTurn]
    verdict: Optional[JudgeVerdict] = None
    execution_trace: List[ExecutionTraceItem]
    execution_time: float

class DebateSummary(BaseModel):
    id: int
    topic: str
    mode: str
    rounds: int
    winner: Optional[str]
    for_score: Optional[int]
    against_score: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class DebateDetail(DebateSummary):
    transcript: List[DebateTurn]
    verdict: Optional[Dict[str, Any]] = None
