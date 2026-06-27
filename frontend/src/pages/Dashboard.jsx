import React, { useState, useEffect } from 'react';
import { quizService, attemptService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Trash2, PlusCircle, Award, Target, BookOpen, TrendingUp, Calendar, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ScoreBadge = ({ pct }) => {
  const p = parseFloat(pct);
  if (p >= 70) return <span className="badge badge-green">{p.toFixed(0)}%</span>;
  if (p >= 40) return <span className="badge badge-amber">{p.toFixed(0)}%</span>;
  return <span className="badge badge-red">{p.toFixed(0)}%</span>;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [attempts,       setAttempts]       = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: aData }, { data: qData }] = await Promise.all([
          attemptService.getUserAttempts(),
          quizService.getUserQuizzes(),
        ]);
        setAttempts(aData);
        setCreatedQuizzes(qData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz? This cannot be undone.')) return;
    try {
      await quizService.delete(id);
      toast.success('Quiz deleted');
      setCreatedQuizzes(p => p.filter(q => q.id !== id));
    } catch {
      toast.error('Failed to delete quiz');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
      <div className="spinner" />
      <p className="text-slate-400 text-sm">Loading dashboard…</p>
    </div>
  );

  const avgScore = attempts.length
    ? (attempts.reduce((s, a) => s + parseFloat(a.percentage), 0) / attempts.length).toFixed(1)
    : 0;
  const best = attempts.length
    ? Math.max(...attempts.map(a => parseFloat(a.percentage))).toFixed(0)
    : '—';

  const stats = [
    { label: 'Quizzes Taken',    value: attempts.length,        icon: BookOpen,    color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Quizzes Created',  value: createdQuizzes.length,  icon: PlusCircle,  color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Average Score',    value: `${avgScore}%`,         icon: Target,      color: 'bg-amber-50 text-amber-600' },
    { label: 'Best Score',       value: `${best}${best !== '—' ? '%' : ''}`, icon: TrendingUp, color: 'bg-pink-50 text-pink-600' },
  ];

  return (
    <div className="section-container py-10">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-soft mb-8"
      >
        <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-indigo">
          <Award size={26} className="text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Hey, {user?.name}! 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {attempts.length > 0
              ? `You've taken ${attempts.length} quiz${attempts.length > 1 ? 'zes' : ''} · avg score ${avgScore}%`
              : 'Take a quiz or create your own — both are just one click away.'}
          </p>
        </div>
        <Link to="/create-quiz" className="btn-primary text-sm py-2.5 shrink-0">
          <PlusCircle size={15} /> New quiz
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="stat-card"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 leading-none">{s.value}</div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── My Created Quizzes ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">My Created Quizzes</h2>
          <Link to="/create-quiz" className="btn-secondary text-xs py-2 px-4">
            <PlusCircle size={13} /> Create new
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          {createdQuizzes.length === 0 ? (
            <div className="py-14 text-center">
              <PlusCircle size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-medium mb-4">You haven't created any quizzes yet.</p>
              <Link to="/create-quiz" className="btn-primary text-sm inline-flex">Create your first quiz</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Category</th>
                    <th>Questions</th>
                    <th>Attempts</th>
                    <th>Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {createdQuizzes.map(quiz => (
                    <tr key={quiz.id}>
                      <td>
                        <span className="font-semibold text-slate-800">{quiz.title}</span>
                      </td>
                      <td><span className="badge badge-indigo">{quiz.category}</span></td>
                      <td><span className="text-slate-600">{quiz.question_count}</span></td>
                      <td>
                        <span className="font-semibold text-slate-700">{quiz.attempt_count ?? 0}</span>
                        <span className="text-slate-400 text-xs ml-1">attempts</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                          <Calendar size={11} />
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {/* Report — visible to creator only (they own this quiz) */}
                          <Link
                            to={`/quiz/${quiz.id}/report`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <BarChart2 size={13} /> Report
                          </Link>
                          <button
                            onClick={() => handleDelete(quiz.id)}
                            className="btn-danger text-xs py-1.5 px-3"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── My Attempts ── */}
      <section>
        <h2 className="text-base font-bold text-slate-800 mb-4">My Quiz History</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          {attempts.length === 0 ? (
            <div className="py-14 text-center">
              <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-medium mb-4">No quizzes taken yet.</p>
              <Link to="/quizzes" className="btn-primary text-sm inline-flex">Browse quizzes</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quiz</th>
                    <th>Score</th>
                    <th>Performance</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map(a => (
                    <tr key={a.id}>
                      <td>
                        <span className="font-semibold text-slate-800">{a.quiz_title}</span>
                        <span className="block text-xs text-slate-400 mt-0.5">{a.category}</span>
                      </td>
                      <td>
                        <span className="font-bold text-slate-900">{a.score}</span>
                        <span className="text-slate-400 text-sm"> / {a.total_questions}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3 min-w-[140px]">
                          <div className="progress-track flex-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${a.percentage}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut' }}
                              className={`progress-fill ${
                                parseFloat(a.percentage) >= 70 ? 'bg-emerald-500' :
                                parseFloat(a.percentage) >= 40 ? 'bg-amber-500' : 'bg-red-400'
                              }`}
                            />
                          </div>
                          <ScoreBadge pct={a.percentage} />
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Calendar size={11} />
                          {new Date(a.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
