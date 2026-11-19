import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  // 1. Get the token and role from local storage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // 2. If there is no token, kick them to the sign-in page
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // 3. If they have a token, but their role doesn't match (e.g., a Customer trying to view the Staff dashboard)
  if (allowedRole && userRole !== allowedRole) {
    // Kick them to their own dashboard, or the home page
    return <Navigate to={userRole === 'Staff' ? '/staff-dashboard' : '/customer-dashboard'} replace />;
  }

  // 4. If they pass the checks, show the page
  return children;
};

export default ProtectedRoute;