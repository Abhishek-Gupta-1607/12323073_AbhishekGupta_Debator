import pytest
from app.agents.for_agent import ForAgent
from app.agents.against_agent import AgainstAgent

def test_agent_initialization():
    for_agent = ForAgent()
    against_agent = AgainstAgent()
    
    assert for_agent.role == "FOR"
    assert against_agent.role == "AGAINST"
