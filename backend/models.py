from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String(500), index=True) # Length might need adjustment for long URLs
    title = Column(String(255))
    summary = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    related_topics = relationship("RelatedTopic", back_populates="quiz", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    question_text = Column(Text)
    options = Column(JSON) # Storing options as a JSON list ["A", "B", "C", "D"]
    correct_answer = Column(String(255))
    explanation = Column(Text)
    difficulty = Column(String(50))

    quiz = relationship("Quiz", back_populates="questions")

class RelatedTopic(Base):
    __tablename__ = "related_topics"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    topic_name = Column(String(255))

    quiz = relationship("Quiz", back_populates="related_topics")
