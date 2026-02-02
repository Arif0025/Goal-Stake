import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from models import db, Module, Question, User, UserModuleProgress
from services import ingest_recursive, grade_quiz, find_existing_roadmap

load_dotenv()

app = Flask(__name__)
CORS(app) 

# --- DATABASE CONFIGURATION (Fixed for Timeouts) ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CRITICAL FIX: Keep connections alive and auto-reconnect
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_recycle": 1800,   # Recycle connections every 30 mins
    "pool_pre_ping": True,  # Ping DB before query to ensure connection is alive
    "pool_size": 10,
    "max_overflow": 20
}

db.init_app(app)

# AI Config
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create Tables (Run once)
with app.app_context():
    db.create_all()

# --- ROUTES ---

@app.route('/api/generate-roadmap', methods=['POST'])
def generate_roadmap():
    skill = request.json.get('skill')
    user_id = request.json.get('user_id') 

    # 1. GET USER PREFERENCE
    user_style = 'text' # Default
    if user_id:
        user = User.query.get(user_id)
        if user:
            user_style = user.learning_style

    # DEBUG: Print to terminal to prove Video Mode is active
    print(f"--- GENERATING ROADMAP FOR '{skill}' USING STYLE: {user_style.upper()} ---")

    # 2. DEFINE PROMPT MODIFIERS
    style_instruction = ""
    if user_style == 'video':
        style_instruction = "Instead of a text summary, provide a JSON array of 3 specific YouTube search terms or video titles for this topic under a key called 'video_queries'."
    elif user_style == 'official_docs':
        style_instruction = "Instead of a text summary, provide a list of 2-3 official documentation URLs or standard reference book titles under a key called 'ref_links'."
    else:
        style_instruction = "Provide a concise 2-sentence text summary explaining the concept."

    # 3. SMART CACHING
    existing_roadmap = find_existing_roadmap(skill)
    if existing_roadmap:
        print(f"--- FOUND CACHED ROADMAP FOR {skill} ---")
        if user_id:
            prog = UserModuleProgress.query.filter_by(user_id=user_id, module_id=existing_roadmap.id).first()
            if not prog:
                db.session.add(UserModuleProgress(user_id=user_id, module_id=existing_roadmap.id, status='started'))
                db.session.commit()
        return jsonify({"message": "Roadmap found!", "root_id": existing_roadmap.id})

    # 4. AI GENERATION
    model = genai.GenerativeModel("gemini-flash-latest")

    prompt = f"""
    You are an expert course creator. Create a comprehensive, recursive learning roadmap for the skill: "{skill}".
    
    CRITICAL: Output ONLY valid JSON.
    
    CUSTOMIZATION: The user prefers learning via: {user_style}.
    {style_instruction}
    
    The JSON must follow this exact recursive structure:
    {{
        "topic_name": "{skill}",
        "resources": {{ 
            "explanation": "Summary here (optional if other links provided)",
            "video_queries": ["Query 1", "Query 2"],
            "ref_links": ["URL 1", "URL 2"]
        }},
        "sub_modules": [
            {{
                "topic_name": "Sub-topic",
                "resources": {{ ...same structure as above... }},
                "quiz": {{
                    "question_sets": [
                        {{
                            "questions": [
                                {{
                                    "question": "Question text?",
                                    "options": ["A", "B", "C", "D"],
                                    "correct_answer": "A"
                                }}
                            ]
                        }}
                    ]
                }},
                "sub_modules": [] 
            }}
        ]
    }}
    Make it 2 levels deep.
    """

    try:
        response = model.generate_content(prompt)
        clean_json = response.text.strip()
        if clean_json.startswith("```"):
            clean_json = clean_json.replace("```json", "").replace("```", "")
        
        roadmap_data = json.loads(clean_json)
        
        root_module = ingest_recursive(roadmap_data)
        db.session.commit()
        
        if user_id:
             db.session.add(UserModuleProgress(user_id=user_id, module_id=root_module.id, status='started'))
             db.session.commit()
        
        return jsonify({"message": "Roadmap created!", "root_id": root_module.id})
        
    except Exception as e:
        print(f"Error during generation: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/roadmap/<int:module_id>', methods=['GET'])
def get_roadmap(module_id):
    module = Module.query.get_or_404(module_id)
    return jsonify(module.to_dict())

@app.route('/api/my-goals/<int:user_id>', methods=['GET'])
def get_user_goals(user_id):
    user = User.query.get_or_404(user_id)
    results = db.session.query(Module, UserModuleProgress).join(
        UserModuleProgress, UserModuleProgress.module_id == Module.id
    ).filter(
        UserModuleProgress.user_id == user_id,
        Module.parent_id == None 
    ).all()

    goals = []
    for mod, prog in results:
        goals.append({
            "id": mod.id,
            "title": mod.title,
            "status": prog.status,
            "xp": user.xp,
            "level": user.level
        })
    return jsonify(goals)

@app.route('/api/submit-quiz', methods=['POST'])
def submit_quiz_route():
    data = request.json
    result = grade_quiz(data['user_id'], data['answers'])
    return jsonify(result)

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if User.query.filter((User.email == email) | (User.username == username)).first():
        return jsonify({"error": "User already exists"}), 400

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created!", "user_id": new_user.id}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        return jsonify({
            "message": "Login successful", 
            "user_id": user.id,
            "username": user.username
        }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/user/settings/<int:user_id>', methods=['GET'])
def get_user_settings(user_id):
    user = User.query.get_or_404(user_id)
    # Return the style so the frontend can sync up
    return jsonify({"learning_style": user.learning_style}), 200

@app.route('/api/update-settings', methods=['POST'])
def update_settings():
    data = request.json
    user_id = data.get('user_id')
    style = data.get('learning_style') 
    
    valid_styles = ['text', 'video', 'official_docs']
    
    if not user_id or not style:
        return jsonify({"error": "Missing user_id or learning_style"}), 400

    if style not in valid_styles:
        return jsonify({"error": "Invalid style option"}), 400

    user = User.query.get_or_404(user_id)
    user.learning_style = style
    db.session.commit()
    
    return jsonify({"message": "Settings updated"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)