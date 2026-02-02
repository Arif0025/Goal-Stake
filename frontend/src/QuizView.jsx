import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Award, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import { api } from './api';

const QuizView = ({ moduleId, questions, userId }) => {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOptionChange = (qId, optionIdx) => {
    setAnswers({
      ...answers,
      [qId]: optionIdx
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    const formattedAnswers = Object.keys(answers).map(qId => ({
      question_id: parseInt(qId),
      selected_index: answers[qId]
    }));

    try {
      const res = await api.submitQuiz(formattedAnswers);
      setResult(res.data);
    } catch (err) {
      alert("Failed to submit quiz!");
    }
    setSubmitting(false);
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  // RESULT VIEW
  if (result) {
    const isPass = result.score_percent >= 70;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-4"
      >
        <div className={`
          rounded-xl p-6 border-2
          ${isPass 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
            : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
          }
        `}>
          {/* Score Display */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {isPass ? (
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
              ) : (
                <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h4 className="text-2xl font-bold text-gray-900">
                  {result.score_percent.toFixed(0)}%
                </h4>
                <p className={`text-sm font-medium ${isPass ? 'text-green-700' : 'text-orange-700'}`}>
                  {isPass ? 'Great Job!' : 'Needs Review'}
                </p>
              </div>
            </div>

            {isPass && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Award className="w-12 h-12 text-yellow-500" />
              </motion.div>
            )}
          </div>

          {/* Weak Areas */}
          {result.failed_module_ids && result.failed_module_ids.length > 0 ? (
            <div className="bg-white rounded-lg p-4 border border-orange-200 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 mb-2">Areas for Improvement</p>
                  <p className="text-sm text-gray-700 mb-2">
                    Review these topics to strengthen your understanding:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.failed_module_ids.map((id) => (
                      <span 
                        key={id}
                        className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full"
                      >
                        Module {id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-700">
                  Perfect! No weak areas detected.
                </p>
              </div>
            </div>
          )}

          {/* Retry Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // QUESTIONS VIEW
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-6"
    >
      {questions.map((q, idx) => (
        <div 
          key={q.id}
          className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 shadow-sm"
        >
          {/* Question Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{idx + 1}</span>
            </div>
            <p className="font-semibold text-gray-900 text-lg leading-relaxed">
              {q.text}
            </p>
          </div>

          {/* Options as Cards */}
          <div className="space-y-3">
            {q.options.map((opt, optIdx) => {
              const isSelected = answers[q.id] === optIdx;
              
              return (
                <motion.label
                  key={optIdx}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  {/* Custom Radio */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${isSelected 
                      ? 'border-indigo-600 bg-indigo-600' 
                      : 'border-gray-300'
                    }
                  `}>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </div>

                  {/* Hidden native radio */}
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    checked={isSelected}
                    onChange={() => handleOptionChange(q.id, optIdx)}
                    className="sr-only"
                  />

                  {/* Option Text */}
                  <span className={`
                    flex-1 font-medium transition-colors
                    ${isSelected ? 'text-indigo-900' : 'text-gray-700'}
                  `}>
                    {opt}
                  </span>
                </motion.label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <motion.button
        whileHover={allAnswered ? { scale: 1.02 } : {}}
        whileTap={allAnswered ? { scale: 0.98 } : {}}
        onClick={handleSubmit}
        disabled={submitting || !allAnswered}
        className={`
          w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg
          ${allAnswered && !submitting
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl cursor-pointer' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {submitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Grading Your Answers...
          </>
        ) : allAnswered ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Submit Answers
          </>
        ) : (
          <>
            Answer all questions to submit
          </>
        )}
      </motion.button>
    </motion.div>
  );
};

export default QuizView;