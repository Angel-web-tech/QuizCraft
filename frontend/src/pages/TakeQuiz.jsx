import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService, attemptService } from '../services/api';
import { toast } from 'react-toastify';
import { ChevronLeft, ChevronRight, Send, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz]               = useState(null);
  const [current, setCurrent]         = useState(0);
  const [answers, setAnswers]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [timeLeft, setTimeLeft]       = useState(null);

  const handleSubmit = useCallback(async (ans) => {
    const payload = (ans && typeof ans === 'object' && !ans.nativeEvent) ? ans : answers;
    setSubmitting(true);
    try {
      const { data } = await attemptService.submit({ quiz_id: id, answers: payload });
      navigate(`/results/${data.attempt_id}`, { state: { result: data } });
    } catch {
      toast.error('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  }, [id, answers, navigate]);

  useEffect(() => {
    quizService.getById(id)
      .then(({ data }) => {
        setQuiz(data);
        if (data.time_limit) setTimeLeft(data.time_limit * 60);
      })
      .catch(() => { toast.error('Could not load quiz'); navigate('/quizzes'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) handleSubmit(answers);
      return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, handleSubmit, answers]);

  const select = (questionId, optionId) =>
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="spinner" />
      <p className="text-slate-400 text-sm font-medium">Loading quiz…</p>
    </div>
  );
  if (!quiz) return null;

  const question   = quiz.questions[current];
  const progress   = ((current + 1) / quiz.questions.length) * 100;
  const answered   = Object.keys(answers).length;
  const isLast     = current === quiz.questions.length - 1;
  const isUrgent   = timeLeft !== null && timeLeft < 30;

  return (
    <div className="section-container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

        {/* Quiz header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="badge badge-indigo mb-2">Quiz mode</span>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{quiz.title}</h1>
            <p className="text-slate-400 text-xs mt-1">{answered} of {quiz.questions.length} answered</p>
          </div>

          {timeLeft !== null && (
            <motion.div
              animate={isUrgent ? { scale: [1, 1.08, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className={`flex items-center gap-1.5 font-bold text-sm px-3.5 py-2 rounded-xl border shrink-0 ${
                isUrgent
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-slate-50 text-slate-600 border-slate-100'
              }`}
            >
              <Clock size={14} /> {formatTime(timeLeft)}
            </motion.div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-2">
            <span>Question {current + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="progress-track">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
              className="progress-fill bg-indigo-600"
            />
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden mb-5"
          >
            {/* Accent bar */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

            <div className="p-6 sm:p-8">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-4">
                Question {current + 1}
              </p>
              <h2 className="text-lg font-bold text-slate-900 leading-snug mb-8">
                {question.question_text}
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {question.options.map((opt, i) => {
                  const selected = answers[question.id] === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => select(question.id, opt.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                        selected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        selected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 text-slate-400'
                      }`}>
                        {selected ? <CheckCircle2 size={14} /> : String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-sm font-medium leading-snug">{opt.option_text}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrent(v => v - 1)}
            disabled={current === 0}
            className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {isLast ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-7 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all disabled:opacity-60"
            >
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send size={15} /> Submit answers</>
              }
            </motion.button>
          ) : (
            <button
              onClick={() => setCurrent(v => v + 1)}
              className="btn-primary text-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {quiz.questions.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? 'w-6 h-2 bg-indigo-600'
                  : answers[q.id]
                    ? 'w-2 h-2 bg-indigo-300'
                    : 'w-2 h-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

      </motion.div>
    </div>
  );
};

export default TakeQuiz;
