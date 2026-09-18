import asyncio
import time
from typing import Dict, Any
from app.agents.for_agent import ForAgent
from app.agents.against_agent import AgainstAgent
from app.agents.judge_agent import JudgeAgent
from app.agents.validator import RoleValidator
from app.orchestration.debate_state import DebateState
from app.orchestration.execution_trace import ExecutionTrace
from app.schemas.debate import DebateResponse

class DebateOrchestrator:
    def __init__(self, topic: str, mode: str, rounds: int):
        self.state = DebateState(topic, mode, rounds)
        self.trace = ExecutionTrace()
        
        self.for_agent = ForAgent()
        self.against_agent = AgainstAgent()
        self.judge_agent = JudgeAgent()
        self.validator = RoleValidator()
        self.start_time = time.time()
        
    async def _execute_turn_with_retry(self, agent_instance, role: str, turn_type: str, max_retries: int = 2) -> str:
        prompt_base = f"The topic is: '{self.state.topic}'. This is a {turn_type} turn. "
        current_prompt = prompt_base + "Please provide your argument."
        
        for attempt in range(max_retries + 1):
            self.trace.add_step(role.lower(), "running", f"Preparing {turn_type} argument (Attempt {attempt + 1})")
            try:
                response = await agent_instance.generate_response(current_prompt, self.state.get_transcript())
                
                self.trace.add_step("validator", "running", f"Validating {role}'s response")
                validation = await self.validator.validate(self.state.topic, role, response)
                
                if validation.is_valid:
                    self.trace.add_step("validator", "completed", f"{role}'s response validated successfully")
                    return response
                else:
                    self.trace.add_step("validator", "retrying", f"{role} role violation: {validation.feedback}")
                    current_prompt = prompt_base + f"Your previous attempt violated your role. Feedback: {validation.feedback}. Correct this and provide a valid argument."
            
            except Exception as e:
                self.trace.add_step(role.lower(), "retrying", f"Error generating response: {str(e)}")
                if attempt == max_retries:
                    raise e
                    
        raise ValueError(f"Agent {role} failed to produce a valid response after {max_retries} retries.")

    async def run_debate(self) -> DebateResponse:
        self.trace.add_step("orchestrator", "completed", "Debate initialized")
        
        try:
            # Execute Rounds
            for round_num in range(1, self.state.total_rounds + 1):
                self.state.current_round = round_num
                
                # Determine turn type
                if self.state.mode == "quick" and round_num == 1:
                    turn_type = "opening"
                elif round_num == 1:
                    turn_type = "opening statements"
                elif round_num == self.state.total_rounds and self.state.mode == "full":
                    turn_type = "closing statements"
                else:
                    turn_type = "rebuttal"
                
                self.trace.add_step("orchestrator", "running", f"Starting Round {round_num}: {turn_type}")
                
                # Alternating turn order based on round
                if round_num % 2 != 0:
                    first_agent, first_role = self.for_agent, "FOR"
                    second_agent, second_role = self.against_agent, "AGAINST"
                else:
                    first_agent, first_role = self.against_agent, "AGAINST"
                    second_agent, second_role = self.for_agent, "FOR"

                # If it's round 1 and opening, they can execute concurrently (no dependencies)
                if round_num == 1:
                    self.trace.add_step("orchestrator", "running", "Executing opening statements concurrently")
                    task1 = self._execute_turn_with_retry(first_agent, first_role, turn_type)
                    task2 = self._execute_turn_with_retry(second_agent, second_role, turn_type)
                    
                    res1, res2 = await asyncio.gather(task1, task2)
                    
                    self.state.add_turn(round_num, first_role, turn_type, res1)
                    self.trace.add_step(first_role.lower(), "completed", f"Completed {turn_type}")
                    
                    self.state.add_turn(round_num, second_role, turn_type, res2)
                    self.trace.add_step(second_role.lower(), "completed", f"Completed {turn_type}")
                else:
                    # Sequential execution for rebuttals
                    res1 = await self._execute_turn_with_retry(first_agent, first_role, turn_type)
                    self.state.add_turn(round_num, first_role, turn_type, res1)
                    self.trace.add_step(first_role.lower(), "completed", f"Completed {turn_type}")
                    
                    res2 = await self._execute_turn_with_retry(second_agent, second_role, turn_type)
                    self.state.add_turn(round_num, second_role, turn_type, res2)
                    self.trace.add_step(second_role.lower(), "completed", f"Completed {turn_type}")

            # Judge Evaluation
            self.trace.add_step("judge", "running", "Evaluating debate")
            verdict = await self.judge_agent.evaluate(self.state.topic, self.state.get_transcript())
            self.trace.add_step("judge", "completed", "Evaluation completed")
            
            execution_time = time.time() - self.start_time
            
            return DebateResponse(
                debate_id=0, # Will be set by DB
                topic=self.state.topic,
                mode=self.state.mode,
                rounds=self.state.total_rounds,
                transcript=self.state.get_transcript(),
                verdict=verdict,
                execution_trace=self.trace.get_trace(),
                execution_time=execution_time
            )
            
        except Exception as e:
            self.trace.add_step("orchestrator", "failed", f"Debate failed: {str(e)}")
            raise e
