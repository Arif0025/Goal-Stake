# GoalStake 🎯

GoalStake is a personalized learning platform that uses AI to generate comprehensive mission-based roadmaps for any skill. It gamifies the learning experience with XP, levels, and quizzes, tailored to your preferred learning style.

## ✨ Features

- **AI-Powered Roadmaps**: Generate multi-level learning paths for any skill using Google Gemini AI.
- **Personalized Learning Styles**: Choose between `Video`, `Official Docs`, or `Text-based` summaries.
- **Gamification**: Earn XP and level up by completing quizzes.
- **Progress Tracking**: Track your journey through modules and sub-modules.
- **Smart Caching**: Roadmaps are cached for faster access if they've been generated before.

## 🛠️ Tech Stack

### Backend
- **Framework**: Python / Flask
- **Database**: PostgreSQL (via SQLAlchemy)
- **AI Integration**: Google Generative AI (Gemini Flash)
- **Deployment**: Gunicorn

### Frontend
- **Framework**: React (Vite)
- **Styling**: TailwindCSS
- **State Management**: React Hooks

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js & npm
- Gemini API Key

### Backend Setup
1. Navigate to the root directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Mac/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the root with:
   ```env
   DATABASE_URL=your_postgresql_url
   GEMINI_API_KEY=your_gemini_api_key
   ```
5. Run the server:
   ```bash
   python app.py
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

- `POST /api/generate-roadmap`: Generate a new roadmap for a skill.
- `GET /api/roadmap/<id>`: Retrieve a specific roadmap.
- `GET /api/my-goals/<user_id>`: Get all active goals for a user.
- `POST /api/submit-quiz`: Submit answers for a module quiz.
- `POST /api/signup` / `POST /api/login`: User authentication.
- `POST /api/update-settings`: Update learning style preferences.

## 📝 License

Distributed under the MIT License.
