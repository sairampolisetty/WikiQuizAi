# AI Wiki Quiz Generator

A full-stack application that generates interactive quizzes from any Wikipedia article using Google's Gemini AI. Built with FastAPI (Python) and React (Vite).

## Features
- 🧠 **AI-Powered**: Generates unique questions, answers, and explanations from Wikipedia content.
- 🎮 **Interactive Quiz**: Play through questions one by one with instant feedback.
- 📊 **Scoring**: Get a final score and review your answers at the end.
- 📜 **History**: Automatically saves generated quizzes for later review.
- 🌓 **Responsive UI**: Beautiful dark-mode interface built with Tailwind CSS.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, Google Generative AI (Gemini)
- **Frontend**: React, Tailwind CSS, Lucide Icons, Axios

## Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Google Gemini API Key

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-wiki-quiz.git
cd ai-wiki-quiz
```

### 2. Backend Setup
```bash
cd ai-wiki-quiz
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r backend/requirements.txt
```

**Environment Variables:**
Create a `.env` file in `ai-wiki-quiz/backend/.env`:
```env
GEMINI_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///./ai_wiki_quiz.db
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

You need to run two terminals concurrently.

**Terminal 1 (Backend):**
```bash
# From root directory
.\venv\Scripts\activate
python -m uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
# From frontend directory
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Resetting primary key IDs (if they start unexpectedly high)

If you find that newly generated quiz IDs start from a number greater than 1 (for example, 6), it's usually because the database has previous inserts/deletes which advanced the auto-increment counter. To reset the counters to start from 1 you can use the included management script:

```bash
# From repo root
python backend/reset_ids.py
```

By default the script is conservative: it will only reset tables that are empty. Use `--force` to reset sequences even when tables contain rows (only do this if you know what you're doing — it can cause primary key collisions if you reuse IDs):

```bash
python backend/reset_ids.py --force
```

The script supports SQLite, MySQL and PostgreSQL. It will detect your `DATABASE_URL` automatically from `backend/.env` (or your environment).

## Project Structure
```
ai-wiki-quiz/
├── backend/            # FastAPI server
│   ├── routers/       # API endpoints
│   ├── services/      # AI & Scraper logic
│   ├── main.py        # Entry point
│   └── database.py    # DB connection
├── frontend/           # React application
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   └── index.css      # Tailwind setup
└── README.md
```
