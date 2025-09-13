import React, {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiMenu, FiX, FiHome, FiCalendar, FiTrophy, FiCamera, FiUsers, FiSettings, FiShield, FiAward, FiBarChart, FiInfo} = FiIcons;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    {path: '/', label: 'Home', icon: FiHome},
    {path: '/fixtures', label: 'Fixtures', icon: FiCalendar},
    {path: '/results', label: 'Results', icon: FiBarChart},
    {path: '/gallery', label: 'Gallery', icon: FiCamera},
    {path: '/team', label: 'Team', icon: FiUsers},
    {path: '/admin', label: 'Admin', icon: FiSettings},
  ];

  const isActive = (path) => location.pathname === path;
  const isAdminAuthenticated = localStorage.getItem('rugbyAdminAuth') === 'true';

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">SU</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Sullivan Upper Rugby</h1>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-600">Medallions 25/26</p>
                  <div className="flex items-center text-xs text-gray-500 border-l border-gray-300 pl-2">
                    <SafeIcon icon={FiInfo} className="w-3 h-3 mr-1" />
                    <span>(unofficial site)</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${
                  item.path === '/admin' && isAdminAuthenticated
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : ''
                }`}
              >
                <SafeIcon
                  icon={item.path === '/admin' && isAdminAuthenticated ? FiShield : item.icon}
                  className="w-4 h-4"
                />
                <span>{item.label}</span>
                {item.path === '/admin' && isAdminAuthenticated && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            className="md:hidden py-4 border-t border-gray-200"
          >
            <div className="flex items-center px-4 py-2 mb-2 text-xs text-gray-500 border-b border-gray-200">
              <SafeIcon icon={FiInfo} className="w-3 h-3 mr-1" />
              <span>This is an unofficial fan-created site</span>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-green-50 text-green-700 border-r-4 border-green-600'
                    : 'text-gray-700 hover:bg-gray-50'
                } ${
                  item.path === '/admin' && isAdminAuthenticated ? 'bg-green-50 text-green-700' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <SafeIcon
                  icon={item.path === '/admin' && isAdminAuthenticated ? FiShield : item.icon}
                  className="w-5 h-5"
                />
                <span>{item.label}</span>
                {item.path === '/admin' && isAdminAuthenticated && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full ml-auto">
                    Active
                  </span>
                )}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;