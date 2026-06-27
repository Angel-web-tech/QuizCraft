import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects already-logged-in users away from login/register pages
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="spinner" />
    </div>
  );

  if (user) return <Navigate to="/" replace />;

  return children;
};

export default GuestRoute;
