import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizService } from '../services/api';
import { Search, BookOpen, Clock, ChevronRight, Brain, Trophy, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryMeta = {
  Science:       { color: 'badge-green' },
  Tech:          { color: 'badge-blue' },
  Gaming:        { color: 'badge-pink' },
  Nature:        { color: 'badge-green' },
  General:       { color: 'badge-slate' },
  Entertainment: { color: 'badge-amber' },
};

const QuizCard = ({ quiz, index }) => {
  const meta = categoryMeta[quiz.category] || { color: 'badge-slate' };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link to={`/quizzes/${quiz.id}`} className="group block h-full">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <span className={`badge ${meta.color}`}>{quiz.category}</span>
            <div className="flex items-center gap-1 text-slate-300 group-hover:text-amber-500 transition-colors">
              <Trophy size={13} />
              <span className="text-xs font-medium">XP</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {quiz.title}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-5 flex-1">
            {quiz.description || 'No description provided.'}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen size={12} /> {quiz.question_count || 0} questions
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> {quiz.time_limit || 0} min
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
              <ChevronRight size={15} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const CATEGORIES = [
  { name: 'All', value: '' },
  { name: 'Science', value: 'Science' },
  { name: 'Tech', value: 'Tech' },
  { name: 'Gaming', value: 'Gaming' },
  { name: 'Nature', value: 'Nature' },
  { name: 'General', value: 'General' },
  { name: 'Entertainment', value: 'Entertainment' },
];

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await quizService.getAll({ search, category });
        if (!cancelled) setQuizzes(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    const t = setTimeout(fetch, search ? 350 : 0); // debounce search
    return () => { cancelled = true; clearTimeout(t); };
  }, [search, category]);

  return (
    <div className="section-container py-10">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo shrink-0">
              <Brain size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Knowledge Hub</h1>
          </div>
          <p className="text-slate-500 text-sm">Browse and take quizzes across topics. Filter by category below.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quizzes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 border ${
              category === cat.value
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo'
                : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Layers size={28} className="text-slate-300" />
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1">No quizzes found</h3>
          <p className="text-slate-400 text-sm">Try a different search term or category.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400 font-medium mb-4">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {quizzes.map((quiz, idx) => (
                <QuizCard key={quiz.id} quiz={quiz} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};

export default QuizList;
