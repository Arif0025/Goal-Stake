from models import db, Module, Question, UserModuleProgress, UserQuizAttempt, User
from sqlalchemy import func

# --- 1. RECURSIVE INGESTION (Fixed for Video Mode) ---
def ingest_recursive(data, parent=None):
    """
    Takes the JSON from Gemini and recursively saves it to the Database.
    """
    resources = data.get('resources', {})
    
    # FIX: Handle cases where AI gives videos but NO text summary
    summary_text = resources.get('explanation', "")
    if not summary_text:
        if 'video_queries' in resources:
            summary_text = "Video tutorials and resources available. Click to watch."
        elif 'ref_links' in resources:
            summary_text = "Official documentation links available."
        else:
            summary_text = "No summary provided."

    # 1. Create the Module
    module = Module(
        title=data.get('topic_name'),
        summary=summary_text,     # Now guaranteed to have text
        resource_data=resources   # Stores the raw video links/docs
    )
    
    if parent:
        module.parent = parent

    db.session.add(module)
    
    # 2. Process Quiz Questions
    quiz_data = data.get('quiz', {})
    question_sets = quiz_data.get('question_sets', [])
    
    for q_set in question_sets:
        for q_data in q_set.get('questions', []):
            question = Question(
                text=q_data['question'],
                options=q_data['options'],
                correct_option_index=0, # Default
                module=module
            )
            
            # --- SMARTER ANSWER MATCHING ---
            correct_raw = q_data.get('correct_answer')
            
            # Case 1: Letter "A", "B", "C", "D"
            if isinstance(correct_raw, str) and len(correct_raw) == 1 and correct_raw.upper() in ['A', 'B', 'C', 'D']:
                letter_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3}
                question.correct_option_index = letter_map[correct_raw.upper()]
                
            # Case 2: Exact Text Match
            elif correct_raw in q_data['options']:
                question.correct_option_index = q_data['options'].index(correct_raw)
            
            db.session.add(question)

    # 3. Recursion
    for sub_data in data.get('sub_modules', []):
        ingest_recursive(sub_data, parent=module)

    return module

# --- 2. SMART SEARCH ---
def find_existing_roadmap(skill_name):
    return Module.query.filter(
        func.lower(Module.title) == func.lower(skill_name),
        Module.parent_id == None
    ).first()

# --- 3. UPDATED GRADING (Fixes "Needs Improvement" Stuck Bug) ---
def grade_quiz(user_id, answers):
    attempted_modules = set() # Track all modules in this quiz
    failed_modules = set()
    correct_count = 0
    total = len(answers)
    xp_gained = 0

    for ans in answers:
        question = Question.query.get(ans['question_id'])
        if not question: continue
        
        # Track that we touched this module
        attempted_modules.add(question.module_id)
            
        is_correct = (question.correct_option_index == ans['selected_index'])
        
        # History check
        already_solved = UserQuizAttempt.query.filter_by(
            user_id=user_id, 
            question_id=question.id, 
            is_correct=True
        ).first()

        db.session.add(UserQuizAttempt(
            user_id=user_id,
            question_id=question.id,
            is_correct=is_correct
        ))

        if is_correct:
            correct_count += 1
            if not already_solved:
                xp_gained += 10 
        else:
            failed_modules.add(question.module_id)

    # Score Calculation
    score_percent = (correct_count / total) * 100 if total > 0 else 0
    
    # Level Up Logic
    user = User.query.get(user_id)
    if user and xp_gained > 0:
        user.xp += xp_gained
        new_level = 1 + (user.xp // 100)
        if new_level > user.level:
            user.level = new_level

    # --- CRITICAL FIX: Update Module Status Correctly ---
    for mod_id in attempted_modules:
        prog = UserModuleProgress.query.filter_by(user_id=user_id, module_id=mod_id).first()
        if not prog:
            prog = UserModuleProgress(user_id=user_id, module_id=mod_id)
            db.session.add(prog)
        
        prog.last_quiz_score = score_percent
        
        # If it's in the failed set, mark TRUE.
        # If it is NOT in the failed set (meaning we passed it), mark FALSE.
        if mod_id in failed_modules:
            prog.needs_revision = True
        else:
            prog.needs_revision = False  # <--- THIS WAS MISSING

    db.session.commit()
    
    return {
        "score_percent": score_percent,
        "failed_module_ids": list(failed_modules),
        "xp_earned": xp_gained,
        "current_level": user.level if user else 1
    }