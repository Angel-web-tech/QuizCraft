import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizService } from '../services/api';
import { BarChart2, Users, Trophy, Target, ArrowLeft, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ScoreBadge = ({ pct }) => {
  const p = parseFloat(pct);
  if (p >= 70) return <span className="badge badge-green">{p.toFixed(0)}%</span>;
  if (p >= 40) return <span className="badge badge-amber">{p.toFixed(0)}%</span>;
  return <span className="badge badge-red">{p.toFixed(0)}%</span>;
};

const QuizReport = () => {
  const { id }            = useParams();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    quizService.getReports(id)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load report'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] flex-col gap-3">
      <div className="spinner" />
      <p className="text-slate-400 text-sm">Loading report…</p>
    </div>
  );

  if (error) return (
    <div className="section-container py-20 text-center">
      <XCircle size={48} className="mx-auto text-red-300 mb-4" />
      <h2 className="text-lg font-bold text-slate-700 mb-2">Access denied</h2>
      <p className="text-slate-400 text-sm mb-6">{error}</p>
      <Link to="/dashboard" className="btn-primary text-sm">Back to Dashboard</Link>
    </div>
  );

  const { quiz_title, total_attempts, avg_score, attempts } = data;
  const best = attempts.length
    ? Math.max(...attempts.map(a => parseFloat(a.percentage))).toFixed(0)
    : 0;
  const passed = attempts.filter(a => parseFloat(a.percentage) >= 70).length;

  const stats = [
    { label: 'Total Attempts', value: total_attempts,       icon: Users,   color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Average Score',  value: `${avg_score}%`,      icon: Target,  color: 'bg-amber-50 text-amber-600' },
    { label: 'Best Score',     value: `${best}%`,           icon: Trophy,  color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pass Rate (≥70%)',value: total_attempts > 0 ? `${((passed/total_attempts)*100).toFixed(0)}%` : '—', icon: CheckCircle2, color: 'bg-pink-50 text-pink-600' },
  ];

  return (
    <div className="section-container py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

        {/* Back link */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-soft">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo shrink-0">
            <BarChart2 size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Quiz Report</p>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{quiz_title}</h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

        {/* Attempts table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-700">All Attempts</h2>
          </div>

          {attempts.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm font-medium">Nobody has attempted this quiz yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Participant</th>
                    <th>Score</th>
                    <th>Performance</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, i) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="text-slate-400 text-xs font-semibold">{i + 1}</td>
                      <td>
                        <div className="font-semibold text-slate-800">{a.user_name}</div>
                        <div className="text-xs text-slate-400">{a.user_email}</div>
                      </td>
                      <td>
                        <span className="font-bold text-slate-900">{a.score}</span>
                        <span className="text-slate-400 text-sm"> / {a.total_questions}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-3 min-w-[130px]">
                          <div className="progress-track flex-1">
                            <div
                              className={`progress-fill ${
                                parseFloat(a.percentage) >= 70 ? 'bg-emerald-500' :
                                parseFloat(a.percentage) >= 40 ? 'bg-amber-500' : 'bg-red-400'
                              }`}
                              style={{ width: `${parseFloat(a.percentage)}%` }}
                            />
                          </div>
                          <ScoreBadge pct={a.percentage} />
                        </div>
                      </td>
                      <td>
                        {parseFloat(a.percentage) >= 70
                          ? <span className="badge badge-green flex items-center gap-1 w-fit"><CheckCircle2 size={11} /> Passed</span>
                          : <span className="badge badge-red  flex items-center gap-1 w-fit"><XCircle size={11} /> Failed</span>
                        }
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <Calendar size={11} />
                          {new Date(a.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};

export default QuizReport;
