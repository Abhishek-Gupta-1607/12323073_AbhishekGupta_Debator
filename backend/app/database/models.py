from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.database import Base

class Debate(Base):
    __tablename__ = "debates"
    
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, index=True, nullable=False)
    mode = Column(String, nullable=False)
    rounds = Column(Integer, nullable=False)
    winner = Column(String, nullable=True)
    for_score = Column(Integer, nullable=True)
    against_score = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    arguments = relationship("DebateArgument", back_populates="debate", cascade="all, delete-orphan")
    verdicts = relationship("JudgeResult", back_populates="debate", cascade="all, delete-orphan")

class DebateArgument(Base):
    __tablename__ = "debate_arguments"
    
    id = Column(Integer, primary_key=True, index=True)
    debate_id = Column(Integer, ForeignKey("debates.id"), nullable=False)
    round_num = Column(Integer, nullable=False)
    agent = Column(String, nullable=False)
    argument_type = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    debate = relationship("Debate", back_populates="arguments")

class JudgeResult(Base):
    __tablename__ = "judge_results"
    
    id = Column(Integer, primary_key=True, index=True)
    debate_id = Column(Integer, ForeignKey("debates.id"), nullable=False)
    criteria_json = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=False)
    final_verdict = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    debate = relationship("Debate", back_populates="verdicts")
