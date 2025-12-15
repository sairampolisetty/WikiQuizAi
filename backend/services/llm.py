import google.generativeai as genai
import os
import json
import time
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_quiz(text: str) -> dict:
    models_to_try = [
        'models/gemini-flash-latest',
        'models/gemini-2.5-pro',
    ]

    prompt = f"""
    You are an expert quiz generator. Based on the following text from a Wikipedia article, generate a quiz.
    
    The output MUST be a valid JSON object with the following structure:
    {{
        "summary": "A short summary of the article (2-3 sentences)",
        "key_entities": {{
            "people": ["List of key people"],
            "organizations": ["List of key organizations"],
            "locations": ["List of key locations"]
        }},
        "sections": ["List of main sections covered"],
        "quiz": [
            {{
                "question": "Question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "The correct option text",
                "difficulty": "easy/medium/hard",
                "explanation": "Short explanation of the answer"
            }}
        ],
        "related_topics": ["Topic 1", "Topic 2", "Topic 3"]
    }}
    
    Generate 5 multiple-choice questions. Ensure strict JSON formatting. Do not include markdown code ticks (```json ... ```).
    
    Text:
    {text}
    """

    last_error = None
    for model_name in models_to_try:
        try:
            print(f"Attempting generation with model: {model_name}")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            # Clean potential markdown formatting
            cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned_text)
        except Exception as e:
            print(f"Failed with {model_name}: {e}")
            last_error = e

    print(f"All models failed. Last error: {last_error}")
    raise last_error
