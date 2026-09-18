from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.debate import DebateRequest, DebateResponse
from app.orchestration.debate_orchestrator import DebateOrchestrator
from app.database.database import get_db
from app.database import models
import json

router = APIRouter()

@router.post("/debate", response_model=DebateResponse)
async def create_debate(request: DebateRequest, db: Session = Depends(get_db)):
    try:
        orchestrator = DebateOrchestrator(
            topic=request.topic,
            mode=request.mode,
            rounds=request.rounds
        )
        
        response = await orchestrator.run_debate()
        
        # Save to DB
        db_debate = models.Debate(
            topic=response.topic,
            mode=response.mode,
            rounds=response.rounds,
            winner=response.verdict.winner if response.verdict else None,
            for_score=response.verdict.for_score if response.verdict else None,
            against_score=response.verdict.against_score if response.verdict else None
        )
        db.add(db_debate)
        db.flush() # To get the ID
        
        # Save arguments
        for turn in response.transcript:
            db_arg = models.DebateArgument(
                debate_id=db_debate.id,
                round_num=turn.round,
                agent=turn.agent,
                argument_type=turn.type,
                content=turn.content
            )
            db.add(db_arg)
            
        # Save verdict
        if response.verdict:
            db_verdict = models.JudgeResult(
                debate_id=db_debate.id,
                criteria_json=json.dumps(response.verdict.criteria.model_dump(by_alias=True)),
                reasoning=response.verdict.reasoning,
                final_verdict=response.verdict.final_verdict
            )
            db.add(db_verdict)
            
        db.commit()
        
        response.debate_id = db_debate.id
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
