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
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import StreamingResponse
import asyncio

@router.post("/debate/stream")
async def stream_debate(request: DebateRequest, db: Session = Depends(get_db)):
    stream_queue = asyncio.Queue()
    
    orchestrator = DebateOrchestrator(
        topic=request.topic,
        mode=request.mode,
        rounds=request.rounds,
        stream_queue=stream_queue
    )
    
    async def event_generator():
        task = asyncio.create_task(orchestrator.run_debate())
        
        while not task.done() or not stream_queue.empty():
            try:
                item = await asyncio.wait_for(stream_queue.get(), timeout=0.1)
                yield f"data: {json.dumps(item)}\n\n"
            except asyncio.TimeoutError:
                continue
                
        try:
            response = task.result()
            
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
            db.flush()
            
            for turn in response.transcript:
                db_arg = models.DebateArgument(
                    debate_id=db_debate.id,
                    round_num=turn.round,
                    agent=turn.agent,
                    argument_type=turn.type,
                    content=turn.content
                )
                db.add(db_arg)
                
            if response.verdict:
                db_verdict = models.JudgeResult(
                    debate_id=db_debate.id,
                    criteria_json=json.dumps(response.verdict.criteria.model_dump(by_alias=True)),
                    reasoning=response.verdict.reasoning,
                    final_verdict=response.verdict.final_verdict
                )
                db.add(db_verdict)
                
            db.commit()
            
            yield f"data: {json.dumps({'event': 'complete', 'data': {'debate_id': db_debate.id, 'execution_time': response.execution_time}})}\n\n"
        except Exception as e:
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'event': 'error', 'data': str(e)})}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
