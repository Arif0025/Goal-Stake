import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Target, TrendingUp, Award, LogOut, Home, BookMarked, 
  Settings, Rocket, ArrowLeft, FileText, Video, BookText, Check 
} from 'lucide-react';
import { api } from './api';
import ModuleItem from './RoadmapView';
import Sidebar from './components/Sidebar';
import LandingPage from './LandingPage';
import { GoalStakeLogo } from './components/GoalStakeLogo';

function App() {
  // === STATE ===
  const [user, setUser] = useState(localStorage.getItem('user_id'));
  const [view, setView] = useState('dashboard');
  const [showAuth, setShowAuth] = useState(false);
  
  const [inputSkill, setInputSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [prefStyle, setPrefStyle] = useState('text');
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  const [roadmapData, setRoadmapData] = useState(null);
  const [myGoals, setMyGoals] = useState([]);
  const [userStats, setUserStats] = useState({ level: 1, xp: 0 });

  const [isLoginMode, setIsLoginMode] = useState(true);

  // === LOAD DASHBOARD DATA ===
  useEffect(() => {
    if (user && view === 'dashboard') {
      loadDashboard();
    }
  }, [user, view]);

  const loadDashboard = async () => {
    try {
      const res = await api.getUserGoals(user);
      if (res.data.length > 0) {
        setUserStats({ level: res.data[0].level, xp: res.data[0].xp });
      }
      setMyGoals(res.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    }
  };

  // === HANDLERS ===
  const handleAuth = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const email = !isLoginMode ? e.target.email.value : null;

    try {
      let res;
      if (isLoginMode) {
        res = await api.login({ username, password });
      } else {
        res = await api.signup({ username, email, password });
      }
      localStorage.setItem('user_id', res.data.user_id);
      setUser(res.data.user_id);
      setShowAuth(false);
    } catch (err) {
      alert("Auth Failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleGenerate = async () => {
    if (!inputSkill) return;
    setLoading(true);
    try {
      const res = await api.generateRoadmap(inputSkill);
      openRoadmap(res.data.root_id);
    } catch (err) {
      alert("Error generating roadmap.");
    }
    setLoading(false);
  };

  const openRoadmap = async (id) => {
    setLoading(true);
    try {
      const treeRes = await api.getRoadmap(id);
      setRoadmapData(treeRes.data);
      setView('roadmap');
    } catch (err) {
      alert("Could not load roadmap.");
    }
    setLoading(false);
  };

  const handleStyleChange = async (newStyle) => {
    setPrefStyle(newStyle);
    if (user) {
      try {
        await api.updateSettings(user, newStyle);
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      } catch (err) {
        console.error("Failed to save setting", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowAuth(false);
  };

  const handleGetStarted = () => {
    setShowAuth(true);
    setIsLoginMode(false);
  };

  // === LANDING PAGE ===
  if (!user && !showAuth) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // === AUTH SCREEN ===
  if (!user && showAuth) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Brand Side - Hidden on Mobile */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center px-16 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <GoalStakeLogo size={48} />
                <h1 className="text-5xl font-bold tracking-tight">Goal Stake</h1>
              </div>
              <p className="text-2xl font-light mb-6 leading-relaxed">
                Master any skill through<br />intelligent learning paths
              </p>
              <div className="flex flex-col gap-6 mt-12">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-6 h-6 mt-1 opacity-80" />
                  <div>
                    <p className="font-semibold text-lg">Adaptive Roadmaps</p>
                    <p className="text-sm opacity-80">Personalized learning journeys</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-6 h-6 mt-1 opacity-80" />
                  <div>
                    <p className="font-semibold text-lg">Track Progress</p>
                    <p className="text-sm opacity-80">Level up as you learn</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Form Side - Full Width on Mobile */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gray-50 min-h-screen"
        >
          <div className="w-full max-w-md">
            {/* Back to Landing */}
            <button
              onClick={() => setShowAuth(false)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </button>

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <GoalStakeLogo size={32} />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Goal Stake</h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                {isLoginMode ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-gray-600 mb-6 sm:mb-8">
                {isLoginMode ? 'Continue your learning journey' : 'Start your path to mastery'}
              </p>

              <form onSubmit={handleAuth} className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    name="username"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-base"
                    placeholder="Enter your username"
                  />
                </div>

                {!isLoginMode && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-base"
                      placeholder="your@email.com"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-base"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  {isLoginMode ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm sm:text-base"
                >
                  {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // === MAIN APP WITH SIDEBAR ===
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        view={view}
        setView={setView}
        userStats={userStats}
        onLogout={handleLogout}
      />

      {/* Main Content - Add top padding on mobile for fixed header */}
      <div className="flex-1 overflow-auto pt-16 lg:pt-0">
        <AnimatePresence mode="wait">
          
          {/* ========== DASHBOARD VIEW ========== */}
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 lg:mb-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-xs sm:text-sm font-medium mb-1">Current Level</p>
                      <p className="text-3xl sm:text-4xl font-bold">{userStats.level}</p>
                    </div>
                    <Award className="w-10 h-10 sm:w-12 sm:h-12 opacity-80" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Total XP</p>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900">{userStats.xp}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 sm:col-span-2 md:col-span-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Active Courses</p>
                      <p className="text-3xl sm:text-4xl font-bold text-gray-900">{myGoals.length}</p>
                    </div>
                    <BookMarked className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
                  </div>
                </motion.div>
              </div>

              {/* Start New Goal Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 mb-8 lg:mb-10"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Start a New Goal</h2>
                  <p className="text-sm sm:text-base text-gray-600">What skill do you want to master today?</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                  <input
                    value={inputSkill}
                    onChange={(e) => setInputSkill(e.target.value)}
                    placeholder="e.g., Advanced Python, Machine Learning..."
                    className="flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-base sm:text-lg"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Building...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Activity</h3>
                  <button 
                    onClick={() => setView('learning')}
                    className="text-sm sm:text-base text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                
                {myGoals.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 sm:py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200"
                  >
                    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg px-4">No active courses yet. Start learning above!</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {myGoals.slice(0, 3).map((goal, index) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => openRoadmap(goal.id)}
                        className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                            {goal.status}
                          </span>
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {goal.title}
                        </h4>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <span className="text-xs sm:text-sm text-gray-500">Continue learning →</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========== MY LEARNING VIEW ========== */}
          {view === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">My Learning</h2>
              
              {myGoals.length === 0 ? (
                <div className="text-center py-16 sm:py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg sm:text-xl mb-4 px-4">No courses yet</p>
                  <button
                    onClick={() => setView('dashboard')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm sm:text-base"
                  >
                    Go to Dashboard to start learning →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {myGoals.map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => openRoadmap(goal.id)}
                      className="bg-white rounded-2xl p-5 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                          {goal.status}
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {goal.title}
                      </h4>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs sm:text-sm text-gray-500">Continue learning →</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ========== SETTINGS VIEW ========== */}
          {view === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Settings</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Customize your learning experience</p>

              {/* Success Message */}
              <AnimatePresence>
                {settingsSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
                  >
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-green-700 font-medium text-sm sm:text-base">Settings saved successfully!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Learning Style */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Learning Style Preference</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Choose how you prefer to learn new topics</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Text Option */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStyleChange('text')}
                    className={`
                      p-5 sm:p-6 rounded-xl border-2 cursor-pointer transition-all
                      ${prefStyle === 'text' 
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <FileText className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 ${prefStyle === 'text' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Text Summaries</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Learn through written explanations and summaries</p>
                    {prefStyle === 'text' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-3 flex items-center gap-2 text-indigo-600 font-medium text-xs sm:text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Selected
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Video Option */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStyleChange('video')}
                    className={`
                      p-5 sm:p-6 rounded-xl border-2 cursor-pointer transition-all
                      ${prefStyle === 'video' 
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <Video className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 ${prefStyle === 'video' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Video Tutorials</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Learn through curated YouTube videos</p>
                    {prefStyle === 'video' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-3 flex items-center gap-2 text-indigo-600 font-medium text-xs sm:text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Selected
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Docs Option */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStyleChange('official_docs')}
                    className={`
                      p-5 sm:p-6 rounded-xl border-2 cursor-pointer transition-all md:col-span-3 lg:col-span-1
                      ${prefStyle === 'official_docs' 
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }
                    `}
                  >
                    <BookText className={`w-8 h-8 sm:w-10 sm:h-10 mb-3 ${prefStyle === 'official_docs' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <h4 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">Official Documentation</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Learn from official docs and references</p>
                    {prefStyle === 'official_docs' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-3 flex items-center gap-2 text-indigo-600 font-medium text-xs sm:text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Selected
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== ROADMAP VIEW ========== */}
          {view === 'roadmap' && roadmapData && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto"
            >
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 font-medium transition-colors text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                Back to Dashboard
              </button>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-8 text-white">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{roadmapData.title}</h2>
                  <p className="text-indigo-100 text-sm sm:text-base">Your personalized learning roadmap</p>
                </div>
                
                <div className="p-4 sm:p-6 lg:p-8">
                  <ModuleItem module={roadmapData} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;