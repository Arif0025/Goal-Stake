import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookMarked, Settings, Award, TrendingUp, LogOut, X, Menu } from 'lucide-react';
import { GoalStakeLogo } from './GoalStakeLogo';

const Sidebar = ({ view, setView, userStats, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'learning', icon: BookMarked, label: 'My Learning' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavClick = (itemId) => {
    setView(itemId);
    closeMobileMenu();
  };

  // Sidebar Content (shared between desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <GoalStakeLogo size={40} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Goal Stake</h1>
            <p className="text-xs text-gray-500">Learning Platform</p>
          </div>
        </div>
      </div>

      {/* User Stats Card */}
      <div className="p-6 border-b border-gray-200">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Your Progress</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Level</p>
              <p className="text-2xl font-bold text-indigo-600">{userStats.level}</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-600 mb-1">Total XP</p>
              <p className="text-2xl font-bold text-purple-600">{userStats.xp}</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Next Level</span>
              <span className="text-xs font-semibold text-indigo-600">{userStats.xp % 100}/100 XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(userStats.xp % 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => {
            onLogout();
            closeMobileMenu();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header (Hamburger Menu) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GoalStakeLogo size={32} />
            <h1 className="text-lg font-bold text-gray-900">Goal Stake</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl"
            >
              {/* Close Button */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GoalStakeLogo size={32} />
                  <h1 className="text-lg font-bold text-gray-900">Menu</h1>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 bg-white border-r border-gray-200 flex-col">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;