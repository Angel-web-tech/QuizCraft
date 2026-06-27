import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react';

const Login = () => {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authService.login(form);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}! 🎉`);
      navigate('/', { replace: true });   // go to home page after login
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden">

          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <Zap size={26} className="text-white" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Welcome back</h1>
              <p className="text-slate-400 text-sm">Sign in to create and take quizzes</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email" name="email" placeholder="you@example.com"
                    required autoFocus value={form.email} onChange={set}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="password" name="password" placeholder="••••••••"
                    required value={form.password} onChange={set}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl text-sm mt-1"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign in <ArrowRight size={15} /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              No account yet?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700">
                Create one free
              </Link>
            </p>
          </div>
        </div>

        {/* Helper text */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Test account: <span className="font-mono text-slate-500">admin@quizmaster.com</span> / <span className="font-mono text-slate-500">quizmaster123</span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
