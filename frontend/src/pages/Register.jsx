import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Zap } from 'lucide-react';

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-indigo">
              <Zap size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Create your account</h1>
            <p className="text-slate-500 text-sm">Create quizzes, take quizzes — all in one place</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" name="name" placeholder="Your name"
                  required value={form.name} onChange={set} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" name="email" placeholder="you@example.com"
                  required value={form.email} onChange={set} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Password <span className="normal-case font-normal text-slate-400">(min 6 chars)</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" name="password" placeholder="••••••••"
                  required minLength={6} value={form.password} onChange={set} className="input-field pl-10" />
              </div>
            </div>

            {/* What you get */}
            <div className="bg-indigo-50 rounded-xl p-4 text-xs text-indigo-700 font-medium flex flex-col gap-1.5">
              <p className="font-bold text-indigo-800 mb-1">With your free account you can:</p>
              <p>✓ Take any quiz and see detailed results</p>
              <p>✓ Create your own quizzes and share them</p>
              <p>✓ View reports of who attempted your quizzes</p>
              <p>✓ Track your performance on your dashboard</p>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full py-3 mt-1 rounded-xl text-sm"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Create account <ArrowRight size={15} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
