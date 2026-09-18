import pytest
from app.orchestration.debate_state import DebateState

def test_debate_state_initialization():
    state = DebateState(topic="Test Topic", mode="quick", total_rounds=2)
    assert state.topic == "Test Topic"
    assert state.mode == "quick"
    assert state.total_rounds == 2
    assert state.current_round == 1
    assert len(state.get_transcript()) == 0

def test_debate_state_add_turn():
    state = DebateState(topic="Test Topic", mode="quick", total_rounds=2)
    state.add_turn(1, "FOR", "opening", "Test content")
    
    transcript = state.get_transcript()
    assert len(transcript) == 1
    assert transcript[0]["round"] == 1
    assert transcript[0]["agent"] == "FOR"
    assert transcript[0]["type"] == "opening"
    assert transcript[0]["content"] == "Test content"
