import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('rugbyAdminAuth') === 'true';
  const authTime = localStorage.getItem('rugbyAdminAuthTime');
  const sessionDuration = localStorage.getItem('rugbyAdminSessionDuration') || '7days';

  // Session duration options (in milliseconds)
  const sessionDurations = {
    '1hour': 60 * 60 * 1000,
    '24hours': 24 * 60 * 60 * 1000,
    '7days': 7 * 24 * 60 * 60 * 1000,
    '30days': 30 * 24 * 60 * 60 * 1000,
    '90days': 90 * 24 * 60 * 60 * 1000,
    'permanent': 365 * 24 * 60 * 60 * 1000 // 1 year (effectively permanent)
  };

  // Check if authentication is still valid based on selected duration
  if (isAuthenticated && authTime) {
    const sessionLength = sessionDurations[sessionDuration];
    const isExpired = Date.now() - parseInt(authTime) > sessionLength;
    
    if (isExpired) {
      localStorage.removeItem('rugbyAdminAuth');
      localStorage.removeItem('rugbyAdminAuthTime');
      localStorage.removeItem('rugbyAdminSessionDuration');
      return <Navigate to="/admin" replace />;
    }
    
    return children;
  }

  return <Navigate to="/admin" replace />;
};

export default ProtectedRoute;