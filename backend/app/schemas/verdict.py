from pydantic import BaseModel, Field
from typing import Literal, List, Dict

class CriteriaScore(BaseModel):
    for_score: int = Field(alias="for", ge=0, le=10)
    against_score: int = Field(alias="against", ge=0, le=10)

class Criteria(BaseModel):
    logic: CriteriaScore
    relevance: CriteriaScore
    evidence: CriteriaScore
    counterargument: CriteriaScore
    consistency: CriteriaScore
    practicality: CriteriaScore
    clarity: CriteriaScore
    responsiveness: CriteriaScore

class JudgeVerdict(BaseModel):
    winner: Literal["FOR", "AGAINST", "DRAW"]
    for_score: int = Field(ge=0, le=100)
    against_score: int = Field(ge=0, le=100)
    criteria: Criteria
    for_strengths: List[str]
    for_weaknesses: List[str]
    against_strengths: List[str]
    against_weaknesses: List[str]
    reasoning: str
    final_verdict: str
