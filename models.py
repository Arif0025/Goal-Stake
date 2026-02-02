from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

# --- CONTENT MODELS (The Roadmap) ---
class Module(db.Model):
    __tablename__ = 'modules'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text)
    parent_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=True)
    resource_data = db.Column(db.JSON, default={})
    
    # Relationships
    sub_modules = db.relationship('Module', backref=db.backref('parent', remote_side=[id]))
    questions = db.relationship('Question', backref='module', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "summary": self.summary,
            "resource_data": self.resource_data,
            "questions": [q.to_dict() for q in self.questions],
            "sub_modules": [sub.to_dict() for sub in self.sub_modules]
        }

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    options = db.Column(db.JSON, nullable=False) 
    correct_option_index = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "text": self.text,
            "options": self.options
        }

# --- USER & GAMIFICATION MODELS ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    
    # NEW: Gamification
    xp = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    learning_style = db.Column(db.String(50), default='text')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class UserModuleProgress(db.Model):
    __tablename__ = 'user_module_progress'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    module_id = db.Column(db.Integer, db.ForeignKey('modules.id'), nullable=False)
    
    # NEW: Status for Dashboard (started, completed, in_progress)
    status = db.Column(db.String(20), default='started') 
    is_read = db.Column(db.Boolean, default=False)
    needs_revision = db.Column(db.Boolean, default=False)
    last_quiz_score = db.Column(db.Float, default=0.0)

class UserQuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'))
    is_correct = db.Column(db.Boolean, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)