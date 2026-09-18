from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
from app.database.database import get_db
from app.database import models
from app.schemas.debate import DebateSummary, DebateDetail

router = APIRouter()

@router.get("/debates", response_model=List[DebateSummary])
def get_debates(db: Session = Depends(get_db)):
    debates = db.query(models.Debate).order_by(models.Debate.created_at.desc()).all()
    return debates

@router.get("/debates/{debate_id}", response_model=DebateDetail)
def get_debate(debate_id: int, db: Session = Depends(get_db)):
    debate = db.query(models.Debate).filter(models.Debate.id == debate_id).first()
    if not debate:
        raise HTTPException(status_code=404, detail="Debate not found")
        
    # Format transcript
    transcript = []
    for arg in sorted(debate.arguments, key=lambda x: (x.round_num, x.id)):
        transcript.append({
            "round": arg.round_num,
            "agent": arg.agent,
            "type": arg.argument_type,
            "content": arg.content
        })
        
    # Format verdict
    verdict = None
    if debate.verdicts:
        v = debate.verdicts[0]
        verdict = {
            "winner": debate.winner,
            "for_score": debate.for_score,
            "against_score": debate.against_score,
            "criteria": json.loads(v.criteria_json),
            "reasoning": v.reasoning,
            "final_verdict": v.final_verdict
        }
        
    return {
        "id": debate.id,
        "topic": debate.topic,
        "mode": debate.mode,
        "rounds": debate.rounds,
        "winner": debate.winner,
        "for_score": debate.for_score,
        "against_score": debate.against_score,
        "created_at": debate.created_at,
        "transcript": transcript,
        "verdict": verdict
    }
