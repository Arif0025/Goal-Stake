import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, FileText, AlertCircle, Play, Link as LinkIcon, PlayCircle } from 'lucide-react';
import QuizView from './QuizView';

const ModuleItem = ({ module, depth = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const userId = localStorage.getItem('user_id');
  const hasSubModules = module.sub_modules && module.sub_modules.length > 0;
  const hasQuestions = module.questions && module.questions.length > 0;

  // --- NEW: Smart Resource Renderer (Videos vs Text) ---
  const renderResources = () => {
    const resources = module.resource_data || {};

    // 1. VIDEO MODE
    if (resources.video_queries && resources.video_queries.length > 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Play className="w-4 h-4 text-red-600" fill="currentColor" /> 
            Recommended Tutorials
          </p>
          <div className="flex flex-wrap gap-2">
            {resources.video_queries.map((query, idx) => (
              <a 
                key={idx} 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
              >
                <Play className="w-3 h-3" fill="currentColor" />
                {query}
              </a>
            ))}
          </div>
          {/* Optional fallback text */}
          {module.summary && !module.summary.includes("Video resources available") && (
             <p className="mt-3 text-xs text-gray-500 italic border-t border-gray-200 pt-2">{module.summary}</p>
          )}
        </div>
      );
    }

    // 2. DOCS MODE
    if (resources.ref_links && resources.ref_links.length > 0) {
      return (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> 
            Official References
          </p>
          <ul className="space-y-2">
            {resources.ref_links.map((link, idx) => (
              <li key={idx}>
                <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline text-sm flex items-center gap-2 break-all"
                >
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // 3. TEXT MODE (Default)
    if (module.summary) {
        return (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 leading-relaxed">{module.summary}</p>
            </div>
        );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative ${depth > 0 ? 'ml-8' : ''}`}
    >
      {/* Connection Line for nested modules */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-transparent -ml-4" />
      )}

      {/* Module Card */}
      // In RoadmapView.jsx, update module card padding
      <div className="p-3 sm:p-5 flex items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
        >
          {/* Header */}
          <div 
            onClick={() => setExpanded(!expanded)}
            className="p-5 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Icon & Expand Button */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  {expanded ? <ChevronDown className="w-5 h-5 text-gray-700" /> : <ChevronRight className="w-5 h-5 text-gray-700" />}
                </motion.button>

                {/* Title */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{module.title}</h4>
                  {hasSubModules && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {module.sub_modules.length} sub-module{module.sub_modules.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Quiz Badge */}
              {hasQuestions && (
                <div className="ml-auto">
                  <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {module.questions.length} Question{module.questions.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4">
                  
                  {/* DYNAMIC RESOURCES (Replaces static summary) */}
                  {renderResources()}

                  {/* Quiz Section */}
                  {hasQuestions && (
                    <div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowQuiz(!showQuiz)}
                        className={`
                          w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md
                          ${showQuiz 
                            ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg text-white'
                          }
                        `}
                      >
                        {showQuiz ? (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Close Quiz
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4" />
                            Take Quiz
                          </>
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {showQuiz && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <QuizView 
                              moduleId={module.id} 
                              questions={module.questions} 
                              userId={userId} 
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Sub-modules */}
                  {hasSubModules && (
                    <div className="space-y-3 pt-2">
                      {module.sub_modules.map((sub) => (
                        <ModuleItem key={sub.id} module={sub} depth={depth + 1} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ModuleItem;