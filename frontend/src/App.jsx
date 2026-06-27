import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuizList from './pages/QuizList';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import QuizReport from './pages/QuizReport';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-slate-50 overflow-x-hidden">
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />
        <div className="bg-blob blob-3" />

        <div className="relative z-50">
          <Navbar />
        </div>

        <main className="relative z-10 flex-1">
          <Routes>
            {/* Home — protected, shown after login */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

            {/* Guest only */}
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Protected pages */}
            <Route path="/quizzes"         element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
            <Route path="/quizzes/:id"     element={<ProtectedRoute><TakeQuiz /></ProtectedRoute>} />
            <Route path="/results/:id"     element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create-quiz"     element={<ProtectedRoute><CreateQuiz /></ProtectedRoute>} />
            <Route path="/quiz/:id/report" element={<ProtectedRoute><QuizReport /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          toastClassName="!rounded-xl !font-medium !text-sm"
        />
      </div>
    </Router>
  );
}

export default App;
