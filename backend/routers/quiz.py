from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Quiz, Question, RelatedTopic
from ..services.scraper import scrape_wikipedia
from ..services.llm import generate_quiz
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(
    prefix="/api",
    tags=["quiz"]
)

class QuizRequest(BaseModel):
    url: str

@router.post("/generate")
def generate_quiz_endpoint(request: QuizRequest, db: Session = Depends(get_db)):
    # 1. Check if URL already exists
    existing_quiz = db.query(Quiz).filter(Quiz.url == request.url).first()
    if existing_quiz:
        return {
            "id": existing_quiz.id,
            "url": existing_quiz.url,
            "title": existing_quiz.title,
            "summary": existing_quiz.summary,
            "quiz": existing_quiz.questions,
            "related_topics": [t.topic_name for t in existing_quiz.related_topics]
        }

    # 2. Scrape content
    try:
        scraped_data = scrape_wikipedia(request.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 3. Generate Quiz via LLM
    try:
        ai_data = generate_quiz(scraped_data["content"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Generation failed: {str(e)}")

    # 4. Save to DB
    new_quiz = Quiz(
        url=request.url,
        title=scraped_data["title"],
        summary=ai_data.get("summary", "No summary available")
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    # Save Questions
    for q in ai_data.get("quiz", []):
        new_question = Question(
            quiz_id=new_quiz.id,
            question_text=q["question"],
            options=q["options"],
            correct_answer=q["correct_answer"],
            explanation=q["explanation"],
            difficulty=q["difficulty"]
        )
        db.add(new_question)

    # Save Related Topics
    for topic in ai_data.get("related_topics", []):
        new_topic = RelatedTopic(
            quiz_id=new_quiz.id,
            topic_name=topic
        )
        db.add(new_topic)
    
    db.commit()

    return {
        "id": new_quiz.id,
        "url": new_quiz.url,
        "title": new_quiz.title,
        "summary": new_quiz.summary,
        "quiz": ai_data.get("quiz", []),
        "related_topics": ai_data.get("related_topics", [])
    }

@router.get("/history")
def get_quiz_history(db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).order_by(Quiz.created_at.desc()).all()
    return [
        {
            "id": q.id,
            "title": q.title,
            "url": q.url,
            "created_at": q.created_at
        } 
        for q in quizzes
    ]

@router.get("/quiz/{quiz_id}")
def get_quiz_details(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    return {
        "id": quiz.id,
        "url": quiz.url,
        "title": quiz.title,
        "summary": quiz.summary,
        "quiz": quiz.questions,
        "related_topics": [t.topic_name for t in quiz.related_topics]
    }

@router.delete("/quizzes/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}
