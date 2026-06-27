import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Trash2, Save, Clock, HelpCircle, CheckCircle2, ChevronDown, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['General', 'Science', 'Tech', 'Entertainment', 'Nature', 'Gaming'];

const CreateQuiz = () => {
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category: 'General',
    time_limit: '10',
    questions: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addQuestion = () => {
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question_text: '',
        options: [
          { option_text: '', is_correct: true },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      }],
    }));
  };

  const removeQuestion = (qi) =>
    setQuiz(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== qi) }));

  const updateQuestion = (qi, val) =>
    setQuiz(prev => {
      const qs = [...prev.questions];
      qs[qi] = { ...qs[qi], question_text: val };
      return { ...prev, questions: qs };
    });

  const updateOption = (qi, oi, val) =>
    setQuiz(prev => {
      const qs = [...prev.questions];
      qs[qi].options[oi] = { ...qs[qi].options[oi], option_text: val };
      return { ...prev, questions: qs };
    });

  const setCorrect = (qi, oi) =>
    setQuiz(prev => {
      const qs = [...prev.questions];
      qs[qi].options = qs[qi].options.map((o, i) => ({ ...o, is_correct: i === oi }));
      return { ...prev, questions: qs };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation ──
    if (quiz.title.trim() === '') return toast.error('Please enter a quiz title');
    if (quiz.questions.length === 0) return toast.error('Add at least one question');

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question_text.trim()) return toast.error(`Question ${i + 1} is empty`);
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].option_text.trim()) return toast.error(`Q${i + 1}: Option ${String.fromCharCode(65 + j)} is empty`);
      }
      if (!q.options.some(o => o.is_correct)) return toast.error(`Q${i + 1}: Select a correct answer`);
    }

    setLoading(true);
    try {
      await quizService.create({
        ...quiz,
        time_limit: parseInt(quiz.time_limit) || 10,
      });
      toast.success('Quiz published successfully!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create quiz';
      toast.error(msg);
      console.error('Quiz creation error:', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create a Quiz</h1>
          <p className="text-slate-500 text-sm">Fill in the details below, add your questions, then publish.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Quiz Details card ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block" /> Quiz Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultimate Science Trivia"
                  value={quiz.title}
                  onChange={e => setQuiz(p => ({ ...p, title: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Category *</label>
                <div className="relative">
                  <select
                    required
                    value={quiz.category}
                    onChange={e => setQuiz(p => ({ ...p, category: e.target.value }))}
                    className="input-field appearance-none pr-10"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Time limit (minutes)</label>
                <div className="relative">
                  <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={quiz.time_limit}
                    onChange={e => setQuiz(p => ({ ...p, time_limit: e.target.value }))}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea
                  rows={3}
                  placeholder="What is this quiz about? (optional)"
                  value={quiz.description}
                  onChange={e => setQuiz(p => ({ ...p, description: e.target.value }))}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          {/* ── Questions section ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle size={15} className="text-indigo-500" />
                Questions
                <span className="ml-1 bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {quiz.questions.length}
                </span>
              </h2>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={addQuestion}
                className="btn-primary text-sm py-2"
              >
                <Plus size={15} /> Add question
              </motion.button>
            </div>

            {quiz.questions.length === 0 && (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-14 text-center">
                <HelpCircle size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm font-medium">No questions yet.</p>
                <p className="text-slate-300 text-xs mt-1">Click "Add question" to get started.</p>
              </div>
            )}

            <AnimatePresence>
              {quiz.questions.map((q, qi) => (
                <motion.div
                  key={qi}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 mb-4"
                >
                  {/* Question header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical size={15} className="text-slate-300" />
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                        Q{qi + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qi)}
                      className="btn-danger text-xs py-1.5 px-3"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>

                  {/* Question text */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Question</label>
                    <input
                      type="text"
                      required
                      placeholder="Type your question here…"
                      value={q.question_text}
                      onChange={e => updateQuestion(qi, e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Answer options — <span className="text-indigo-500 normal-case font-medium">select the correct one</span>
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          onClick={() => setCorrect(qi, oi)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                            opt.is_correct
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            opt.is_correct ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                          }`}>
                            {opt.is_correct && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <input
                            type="text"
                            required
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                            value={opt.option_text}
                            onClick={e => e.stopPropagation()}
                            onChange={e => { e.stopPropagation(); updateOption(qi, oi, e.target.value); }}
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 font-medium"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2 pb-8">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary text-sm">
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary text-sm py-3 px-8"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={15} /> Publish quiz</>
              }
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateQuiz;
