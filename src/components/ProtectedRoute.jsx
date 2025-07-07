import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('rugbyAdminAuth') === 'true';
  const authTime = localStorage.getItem('rugbyAdminAuthTime');
  
  // Check if authentication is still valid (24 hours)
  if (isAuthenticated && authTime) {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parseInt(authTime) > twentyFourHours;
    
    if (isExpired) {
      localStorage.removeItem('rugbyAdminAuth');
      localStorage.removeItem('rugbyAdminAuthTime');
      return <Navigate to="/admin" replace />;
    }
    
    return children;
  }
  
  return <Navigate to="/admin" replace />;
};

export default ProtectedRoute;