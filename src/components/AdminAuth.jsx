import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiLock, FiEye, FiEyeOff, FiShield, FiCheck, FiX, FiClock } = FiIcons;

const AdminAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [sessionDuration, setSessionDuration] = useState('7days'); // Default to 7 days

  // Default admin password - updated to the new password
  const ADMIN_PASSWORD = 'SUMEDS009';

  // Session duration options (in milliseconds)
  const sessionDurations = {
    '1hour': 60 * 60 * 1000,
    '24hours': 24 * 60 * 60 * 1000,
    '7days': 7 * 24 * 60 * 60 * 1000,
    '30days': 30 * 24 * 60 * 60 * 1000,
    '90days': 90 * 24 * 60 * 60 * 1000,
    'permanent': 365 * 24 * 60 * 60 * 1000 // 1 year (effectively permanent)
  };

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('rugbyAdminAuth');
    const authTime = localStorage.getItem('rugbyAdminAuthTime');
    const savedDuration = localStorage.getItem('rugbyAdminSessionDuration') || '7days';
    
    // Check for remembered password
    const rememberedPassword = localStorage.getItem('rugbyAdminPassword');
    if (rememberedPassword) {
      setPassword(rememberedPassword);
      setRememberPassword(true);
    }

    // Set the saved session duration
    setSessionDuration(savedDuration);

    if (authStatus === 'true' && authTime) {
      // Check if authentication is still valid based on selected duration
      const sessionLength = sessionDurations[savedDuration];
      const isExpired = Date.now() - parseInt(authTime) > sessionLength;
      
      if (!isExpired) {
        setIsAuthenticated(true);
      } else {
        // Clear expired authentication
        localStorage.removeItem('rugbyAdminAuth');
        localStorage.removeItem('rugbyAdminAuthTime');
      }
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      
      // Store authentication with timestamp and duration
      localStorage.setItem('rugbyAdminAuth', 'true');
      localStorage.setItem('rugbyAdminAuthTime', Date.now().toString());
      localStorage.setItem('rugbyAdminSessionDuration', sessionDuration);
      
      // Store password if remember is checked
      if (rememberPassword) {
        localStorage.setItem('rugbyAdminPassword', password);
      } else {
        localStorage.removeItem('rugbyAdminPassword');
      }
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rugbyAdminAuth');
    localStorage.removeItem('rugbyAdminAuthTime');
    localStorage.removeItem('rugbyAdminSessionDuration');
    
    // Only clear password if user doesn't want it remembered
    if (!rememberPassword) {
      setPassword('');
      localStorage.removeItem('rugbyAdminPassword');
    }
  };

  const handleForgetPassword = () => {
    if (window.confirm('Are you sure you want to forget the saved password?')) {
      localStorage.removeItem('rugbyAdminPassword');
      setPassword('');
      setRememberPassword(false);
    }
  };

  const getSessionExpiryText = () => {
    const authTime = localStorage.getItem('rugbyAdminAuthTime');
    if (!authTime) return '';

    const sessionLength = sessionDurations[sessionDuration];
    const expiryTime = new Date(parseInt(authTime) + sessionLength);
    
    if (sessionDuration === 'permanent') {
      return 'Session never expires';
    }
    
    return `Session expires: ${expiryTime.toLocaleDateString()} ${expiryTime.toLocaleTimeString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiShield} className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Access</h1>
            <p className="text-gray-600">Enter the admin password to access the control panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Session Duration Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiClock} className="w-4 h-4 inline mr-1" />
                Session Duration
              </label>
              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1hour">1 Hour</option>
                <option value="24hours">24 Hours</option>
                <option value="7days">7 Days (Recommended)</option>
                <option value="30days">30 Days</option>
                <option value="90days">90 Days</option>
                <option value="permanent">Never Expire</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                How long should your login session last?
              </p>
            </div>

            {/* Remember Password Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-password"
                    type="checkbox"
                    checked={rememberPassword}
                    onChange={(e) => setRememberPassword(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-password" className="ml-2 block text-sm text-gray-700">
                    Remember password on this device
                  </label>
                </div>
                
                {localStorage.getItem('rugbyAdminPassword') && (
                  <button
                    type="button"
                    onClick={handleForgetPassword}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Forget saved password
                  </button>
                )}
              </div>

              {/* Password Status Indicator */}
              {localStorage.getItem('rugbyAdminPassword') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
                  <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 text-sm">Password remembered on this device</span>
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2"
              >
                <SafeIcon icon={FiLock} className="w-5 h-5 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Access Admin Panel
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Security Note:</strong> This page is protected to prevent unauthorized access to admin functions like adding fixtures, results, and managing team data.
            </p>
            {rememberPassword && (
              <p className="text-sm text-blue-600 mt-2">
                <strong>Remember Password:</strong> Your password will be securely stored on this device only.
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              <strong>Session Duration:</strong> Your login will last for {sessionDuration === 'permanent' ? 'until manually logged out' : sessionDuration.replace(/(\d+)/, '$1 ').replace('days', 'day(s)').replace('hours', 'hour(s)')}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Logout Button */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <SafeIcon icon={FiShield} className="w-4 h-4" />
            <span>Admin Mode Active</span>
            {localStorage.getItem('rugbyAdminPassword') && (
              <span className="text-xs text-blue-600">(Password Remembered)</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-500">
              {getSessionExpiryText()}
            </div>
            {localStorage.getItem('rugbyAdminPassword') && (
              <button
                onClick={handleForgetPassword}
                className="text-xs text-red-600 hover:text-red-800 transition-colors"
              >
                Forget Password
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AdminAuth;