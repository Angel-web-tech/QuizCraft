import React, { useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, LayoutList, Trophy, Star, RefreshCcw, BarChart2, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const scoreInfo = (pct) => {
  if (pct >= 90) return { label: 'Legendary! 🏆', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500', border: 'border-emerald-200', icon: Trophy };
  if (pct >= 70) return { label: 'Great job! 🎉',  color: 'text-indigo-600',  bg: 'bg-indigo-50',  bar: 'bg-indigo-500',  border: 'border-indigo-200',  icon: Star };
  if (pct >= 50) return { label: 'Good effort! 💪', color: 'text-amber-600',   bg: 'bg-amber-50',   bar: 'bg-amber-500',   border: 'border-amber-200',   icon: Star };
  return           { label: 'Keep going! 📚',       color: 'text-red-500',     bg: 'bg-red-50',     bar: 'bg-red-400',     border: 'border-red-200',     icon: RefreshCcw };
};

const Results = () => {
  const { id }     = useParams();
  const location   = useLocation();
  const { result } = location.state || {};

  useEffect(() => {
    if (!result || result.percentage < 70) return;
    const end = Date.now() + 2500;
    const fire = () => {
      confetti({ particleCount: 55, spread: 65, origin: { x: 0.2, y: 0.6 } });
      confetti({ particleCount: 55, spread: 65, origin: { x: 0.8, y: 0.6 } });
      if (Date.now() < end) setTimeout(fire, 300);
    };
    fire();
  }, [result]);

  if (!result) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-4">
      <LayoutList size={48} className="text-slate-300" />
      <h2 className="text-lg font-bold text-slate-700">No result found</h2>
      <p className="text-slate-400 text-sm">You haven't completed a quiz yet.</p>
      <Link to="/quizzes" className="btn-primary text-sm">Browse quizzes</Link>
    </div>
  );

  const info      = scoreInfo(parseFloat(result.percentage));
  const Icon      = info.icon;
  const correct   = result.results?.filter(r => r.is_correct).length ?? result.score;
  const total     = result.total_questions;
  const pct       = parseFloat(result.percentage).toFixed(0);

  return (
    <div className="section-container py-10 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">

        {/* ── Score card ── */}
        <div className={`bg-white rounded-2xl border-2 ${info.border} shadow-soft overflow-hidden`}>
          <div className={`h-1.5 w-full ${info.bar}`} />
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, delay: 0.1 }}
              className={`w-20 h-20 rounded-2xl ${info.bg} flex items-center justify-center mx-auto mb-4`}
            >
              <Icon size={38} className={info.color} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <p className={`text-xs font-bold uppercase tracking-widest ${info.color} mb-1`}>{info.label}</p>
              <h1 className="text-6xl font-extrabold text-slate-900 leading-none mb-2">{pct}%</h1>
              <p className="text-slate-400 text-sm mb-6">
                <span className="font-bold text-slate-700">{correct}</span> correct out of{' '}
                <span className="font-bold text-slate-700">{total}</span> questions
              </p>

              {/* Progress bar */}
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden max-w-xs mx-auto mb-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.35 }}
                  className={`h-full rounded-full ${info.bar}`}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/quizzes" className="btn-secondary text-sm">
                  <LayoutList size={14} /> More quizzes
                </Link>
                <Link to={`/quizzes/${result.quiz_id}`} className="btn-primary text-sm">
                  <RefreshCcw size={14} /> Try again
                </Link>
                <Link to="/dashboard" className="btn-secondary text-sm">
                  <BarChart2 size={14} /> My stats
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Detailed question breakdown ── */}
        {result.results?.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart2 size={17} className="text-indigo-500" />
              Detailed Results
              <span className="ml-auto text-xs font-semibold text-slate-400">
                {correct}/{total} correct
              </span>
            </h2>

            <div className="flex flex-col gap-3">
              {result.results.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className={`bg-white rounded-xl border-2 overflow-hidden shadow-soft ${
                    r.is_correct ? 'border-emerald-200' : 'border-red-200'
                  }`}
                >
                  {/* Question header */}
                  <div className={`flex items-center gap-3 px-4 py-3 ${r.is_correct ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      r.is_correct ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {r.is_correct
                        ? <CheckCircle2 size={16} className="text-emerald-600" />
                        : <XCircle     size={16} className="text-red-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Question {i + 1}</p>
                      <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                        {r.question_text}
                      </p>
                    </div>
                    <span className={`badge shrink-0 text-xs ${r.is_correct ? 'badge-green' : 'badge-red'}`}>
                      {r.is_correct ? '+10 XP' : '0 XP'}
                    </span>
                  </div>

                  {/* Options grid */}
                  <div className="p-4 grid sm:grid-cols-2 gap-2">
                    {r.all_options?.map(opt => {
                      const isCorrect  = opt.id === r.correct_option_id  || opt.id == r.correct_option_id;
                      const isSelected = opt.id === r.user_selected_id   || opt.id == r.user_selected_id;
                      const isWrong    = isSelected && !isCorrect;

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : isWrong
                              ? 'bg-red-50 border-red-300 text-red-700'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isCorrect ? 'border-emerald-500 bg-emerald-500'
                            : isWrong ? 'border-red-400 bg-red-400'
                            : 'border-slate-300'
                          }`}>
                            {isCorrect && <CheckCircle2 size={11} className="text-white" />}
                            {isWrong   && <XCircle     size={11} className="text-white" />}
                          </span>
                          <span className="leading-snug">{opt.option_text}</span>
                          {isCorrect && <span className="ml-auto text-xs text-emerald-600 font-bold">Correct</span>}
                          {isWrong   && <span className="ml-auto text-xs text-red-500 font-bold">Your answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary line if unanswered */}
                  {!r.user_selected_id && (
                    <div className="px-4 pb-3 text-xs text-slate-400 italic">
                      — Not answered. Correct answer: <strong className="text-slate-600">{r.correct_option_text}</strong>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-center gap-4 pb-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors">
            <Home size={14} /> Home
          </Link>
          <span className="text-slate-200">|</span>
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
            <BarChart2 size={14} /> View full history
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default Results;
