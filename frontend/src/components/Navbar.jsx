import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, Zap, LayoutDashboard, PlusCircle,
  BookOpen, Menu, X, ChevronDown, Home as HomeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const dropRef                   = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    setMobileOpen(false);
    navigate('/login');
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { to: '/',            label: 'Home',      Icon: HomeIcon },
    { to: '/quizzes',     label: 'Explore',   Icon: BookOpen },
    { to: '/create-quiz', label: 'Create',     Icon: PlusCircle },
    { to: '/dashboard',   label: 'Dashboard',  Icon: LayoutDashboard },
  ];

  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              Quiz<span className="text-indigo-600">Master</span>
            </span>
          </Link>

          {/* ── Desktop nav (only shown when logged in) ── */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
              {navLinks.map(({ to, label, Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive(to)
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/70'
                  }`}
                >
                  <Icon size={15} /> {label}
                </Link>
              ))}
            </nav>
          )}

          {/* ── Right side ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* User dropdown — click-based */
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(v => !v)}
                  className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-xl font-semibold text-sm transition-colors border-none cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown
                    size={14}
                    className={`text-indigo-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {dropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0,  scale: 1 }}
                      exit={{   opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-[100]"
                    >
                      {/* User info */}
                      <div className="px-3.5 py-2.5 border-b border-slate-50">
                        <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-indigo-500" /> Dashboard
                      </Link>

                      <Link
                        to="/create-quiz"
                        onClick={() => setDropOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                      >
                        <PlusCircle size={15} className="text-emerald-500" /> Create quiz
                      </Link>

                      <div className="mx-3 my-1 border-t border-slate-100" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                      >
                        <LogOut size={15} /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-slate-100 bg-white"
          >
            <div className="px-4 py-3 flex flex-col gap-0.5">
              {user ? (
                <>
                  {/* User info strip */}
                  <div className="flex items-center gap-3 px-3 py-3 mb-1 bg-indigo-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>

                  {navLinks.map(({ to, label, Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                        isActive(to) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={16} /> {label}
                    </Link>
                  ))}

                  <div className="my-2 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors border-none bg-transparent w-full text-left cursor-pointer"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 py-2">
                  <Link to="/login"    className="btn-secondary w-full justify-center py-3 text-sm">Sign in</Link>
                  <Link to="/register" className="btn-primary  w-full justify-center py-3 text-sm">Get started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
