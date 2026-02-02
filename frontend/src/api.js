import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

// Helper to get the user ID from browser storage
const getUser = () => localStorage.getItem('user_id');

export const api = {
    // Auth
    signup: (data) => axios.post(`${API_URL}/signup`, data),
    login: (data) => axios.post(`${API_URL}/login`, data),
    getUserSettings: (userId) => axios.get(`${API_URL}/user/settings/${userId}`),
    
    updateSettings: (userId, learningStyle) => 
    axios.post(`${API_URL}/update-settings`, { 
        user_id: userId, 
        learning_style: learningStyle 
    }),
    // Core Features
    // UPDATE: Now we pass user_id so the backend can "Enroll" us
    generateRoadmap: (skill) => axios.post(`${API_URL}/generate-roadmap`, { 
        skill, 
        user_id: getUser() 
    }),
    
    getRoadmap: (id) => axios.get(`${API_URL}/roadmap/${id}`),
    
    // NEW: Get My Dashboard (XP, Levels, Active Courses)
    getUserGoals: (userId) => axios.get(`${API_URL}/my-goals/${userId}`),
    
    // Quiz
    submitQuiz: (answers) => axios.post(`${API_URL}/submit-quiz`, { 
        user_id: getUser(), 
        answers 
    })
    
};