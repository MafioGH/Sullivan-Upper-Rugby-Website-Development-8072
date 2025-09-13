import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiLock, FiEye, FiEyeOff, FiShield } = FiIcons;

const ProtectedPage = ({ children, pageName }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Password for protected pages - keep this secure and not displayed to users
  const PAGE_PASSWORD = 'SUME005';

  useEffect(() => {
    // Check if user is already authenticated for this specific page
    const authKey = `rugby${pageName}Auth`;
    const timeKey = `rugby${pageName}AuthTime`;
    
    const authStatus = localStorage.getItem(authKey);
    const authTime = localStorage.getItem(timeKey);

    console.log(`Checking auth for ${pageName}:`, { authStatus, authTime });

    if (authStatus === 'true' && authTime) {
      // Check if authentication is still valid (24 hours)
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const isExpired = Date.now() - parseInt(authTime) > twentyFourHours;
      
      if (!isExpired) {
        console.log(`${pageName} auth valid, granting access`);
        setIsAuthenticated(true);
      } else {
        console.log(`${pageName} auth expired, clearing`);
        // Clear expired authentication
        localStorage.removeItem(authKey);
        localStorage.removeItem(timeKey);
      }
    }
    
    setLoading(false);
  }, [pageName]);

  const handleLogin = (e) => {
    e.preventDefault();
    
    console.log('Attempting login with password:', password);
    
    if (password === PAGE_PASSWORD) {
      const authKey = `rugby${pageName}Auth`;
      const timeKey = `rugby${pageName}AuthTime`;
      
      setIsAuthenticated(true);
      setError('');
      
      // Store authentication with timestamp
      localStorage.setItem(authKey, 'true');
      localStorage.setItem(timeKey, Date.now().toString());
      
      console.log(`${pageName} authentication successful`);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
      console.log('Authentication failed - incorrect password');
    }
  };

  const handleLogout = () => {
    const authKey = `rugby${pageName}Auth`;
    const timeKey = `rugby${pageName}AuthTime`;
    
    setIsAuthenticated(false);
    localStorage.removeItem(authKey);
    localStorage.removeItem(timeKey);
    setPassword('');
    setError('');
    
    console.log(`${pageName} logout successful`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiShield} className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Protected Content
            </h1>
            <p className="text-gray-600">
              Enter the password to access {pageName === 'Gallery' ? 'photo gallery' : 'team information'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
                  placeholder="Enter password"
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
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Access {pageName}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> This content is protected to ensure appropriate access to{' '}
              {pageName === 'Gallery' ? 'photos and videos' : 'player information'}.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Session Badge */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <SafeIcon icon={FiShield} className="w-4 h-4" />
            <span>{pageName} Access Granted</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-gray-500">
              Session expires in 24 hours
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded border border-red-200 hover:bg-red-50"
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

export default ProtectedPage;