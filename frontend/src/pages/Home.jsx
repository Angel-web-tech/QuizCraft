import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Rocket, Target, Users, Zap, ArrowRight, PlayCircle, PlusCircle, Trophy, BrainCircuit, CheckCircle } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div {...fadeUp(delay)} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color}`}>
      <Icon size={22} />
    </div>
    <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const Home = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Active Quizzes', value: '500+', icon: BrainCircuit, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Happy Learners', value: '10k+', icon: Users,        color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Success Rate',   value: '94%',  icon: Target,       color: 'bg-amber-50 text-amber-600' },
    { label: 'Rewards Given',  value: '25k',  icon: Trophy,       color: 'bg-pink-50 text-pink-600' },
  ];

  const features = [
    { icon: Zap,     title: 'Instant Feedback',    color: 'bg-indigo-50 text-indigo-600', description: 'Get real-time results and explanations for every question you answer.' },
    { icon: Rocket,  title: 'Creator Tools',        color: 'bg-emerald-50 text-emerald-600', description: 'Build rich quizzes with multiple choices, categories, and time limits.' },
    { icon: Trophy,  title: 'Gamified Experience',  color: 'bg-amber-50 text-amber-600', description: 'Earn XP, collect badges, and climb the leaderboard as you improve.' },
  ];

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:48px_48px] opacity-60 pointer-events-none" />

        <div className="section-container relative z-10 text-center">
          {/* pill badge */}
          <motion.div {...fadeUp()} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full border border-indigo-100 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Interactive Learning Platform
          </motion.div>

          <motion.h1
            {...fadeUp(0.1)}
            className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.05] mb-6"
          >
            Learn more, <br />
            <span className="gradient-text">score higher.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.2)}
            className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            QuizMaster is the fastest way to create, share, and take quizzes.
            Challenge yourself, track your progress, and master any subject.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              to="/quizzes"
              className="btn-primary px-7 py-3.5 text-base rounded-xl shadow-indigo hover:-translate-y-0.5"
            >
              <PlayCircle size={18} /> Explore Quizzes <ArrowRight size={16} />
            </Link>
            {user ? (
              <Link to="/create-quiz" className="btn-secondary px-7 py-3.5 text-base rounded-xl hover:-translate-y-0.5">
                <PlusCircle size={18} /> Create a Quiz
              </Link>
            ) : (
              <Link to="/register" className="btn-secondary px-7 py-3.5 text-base rounded-xl hover:-translate-y-0.5">
                Join for free <ArrowRight size={16} />
              </Link>
            )}
          </motion.div>

          {/* Social proof dots */}
          <motion.div {...fadeUp(0.45)} className="mt-10 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
            <div className="flex -space-x-2">
              {['#6366f1','#ec4899','#10b981','#f59e0b'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
            <span>Join <strong className="text-slate-700">10,000+</strong> learners already inside</span>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon size={20} />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 leading-none">{s.value}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-12">
            <motion.p {...fadeUp()} className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Why QuizMaster</motion.p>
            <motion.h2 {...fadeUp(0.05)} className="section-heading mb-4">Everything you need to learn faster</motion.h2>
            <motion.p {...fadeUp(0.1)} className="text-slate-500 max-w-lg mx-auto text-sm leading-relaxed">
              From quick practice sessions to in-depth knowledge challenges — we've built the tools to help you grow.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} delay={0.1 * i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-slate-900 overflow-hidden relative">
        <div className="absolute inset-0 animated-gradient-bg opacity-10 pointer-events-none" />
        <div className="section-container relative z-10">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Three steps to mastery</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Pick a quiz',      desc: 'Browse hundreds of quizzes across science, tech, gaming, and more.',        icon: BookOpen2 },
              { step: '02', title: 'Test yourself',    desc: 'Answer questions at your own pace with a built-in timer and progress bar.', icon: Zap },
              { step: '03', title: 'Track progress',   desc: 'View your scores, streaks, and performance history on your dashboard.',      icon: Target },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 * i }}
                className="flex flex-col items-center text-center"
              >
                <div className="text-5xl font-extrabold text-white/10 mb-4 leading-none">{item.step}</div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
                  <item.icon size={22} className="text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-indigo-600 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] pointer-events-none" />
        <div className="section-container relative z-10 text-center">
          <motion.h2 {...fadeUp()} className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Ready to level up?
          </motion.h2>
          <motion.p {...fadeUp(0.1)} className="text-indigo-200 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Join thousands of learners and start your quiz journey today. It's free.
          </motion.p>
          <motion.div {...fadeUp(0.2)} className="flex flex-wrap justify-center gap-3">
            {user ? (
              <>
                <Link
                  to="/quizzes"
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg text-sm hover:-translate-y-0.5"
                >
                  <PlayCircle size={16} /> Browse Quizzes
                </Link>
                <Link
                  to="/create-quiz"
                  className="inline-flex items-center gap-2 bg-indigo-500/50 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-500/70 transition-all duration-200 text-sm border border-white/20"
                >
                  <PlusCircle size={16} /> Create a Quiz
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg text-sm hover:-translate-y-0.5"
                >
                  Get started free <ArrowRight size={16} />
                </Link>
                <Link
                  to="/quizzes"
                  className="inline-flex items-center gap-2 bg-indigo-500/50 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-500/70 transition-all duration-200 text-sm border border-white/20"
                >
                  Browse quizzes
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

    </div>
  );
};

// Inline icon for "How it works" section (BookOpen isn't re-exported from above)
const BookOpen2 = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24}
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

export default Home;
