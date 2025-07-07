import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import FixtureCountdown from '../components/FixtureCountdown';
import UlsterRugbyFact from '../components/UlsterRugbyFact';

const { FiTrendingUp, FiCalendar, FiCamera, FiUsers, FiTarget, FiAward, FiEdit2, FiSave, FiX, FiActivity, FiMinus, FiCheckCircle } = FiIcons;

const Home = () => {
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    wins: 0,
    pointsFor: 0,
    pointsAgainst: 0
  });
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [tempStats, setTempStats] = useState(stats);

  // Auto-calculate stats from results
  const calculateStatsFromResults = () => {
    const savedResults = localStorage.getItem('rugbyResults');
    if (savedResults) {
      const results = JSON.parse(savedResults);
      const calculatedStats = {
        gamesPlayed: results.length,
        wins: results.filter(r => r.sullivanScore > r.opponentScore).length,
        pointsFor: results.reduce((sum, r) => sum + r.sullivanScore, 0),
        pointsAgainst: results.reduce((sum, r) => sum + r.opponentScore, 0)
      };
      return calculatedStats;
    }
    return { gamesPlayed: 0, wins: 0, pointsFor: 0, pointsAgainst: 0 };
  };

  // Load stats from localStorage on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem('rugbyStats');
    const calculatedStats = calculateStatsFromResults();
    
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      // Check if user has manually edited stats or if we should use calculated ones
      const hasManualEdits = localStorage.getItem('rugbyStatsManuallyEdited') === 'true';
      
      if (hasManualEdits) {
        setStats(parsedStats);
        setTempStats(parsedStats);
      } else {
        // Use calculated stats and save them
        setStats(calculatedStats);
        setTempStats(calculatedStats);
        localStorage.setItem('rugbyStats', JSON.stringify(calculatedStats));
      }
    } else {
      // Use calculated stats for first time
      setStats(calculatedStats);
      setTempStats(calculatedStats);
      localStorage.setItem('rugbyStats', JSON.stringify(calculatedStats));
    }
  }, []);

  // Listen for changes in results to auto-update stats
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'rugbyResults') {
        const hasManualEdits = localStorage.getItem('rugbyStatsManuallyEdited') === 'true';
        if (!hasManualEdits) {
          const calculatedStats = calculateStatsFromResults();
          setStats(calculatedStats);
          setTempStats(calculatedStats);
          localStorage.setItem('rugbyStats', JSON.stringify(calculatedStats));
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save stats to localStorage whenever stats change
  useEffect(() => {
    localStorage.setItem('rugbyStats', JSON.stringify(stats));
  }, [stats]);

  const handleSaveStats = () => {
    setStats(tempStats);
    setIsEditingStats(false);
    // Mark that stats have been manually edited
    localStorage.setItem('rugbyStatsManuallyEdited', 'true');
  };

  const handleCancelEdit = () => {
    setTempStats(stats);
    setIsEditingStats(false);
  };

  const handleResetToCalculated = () => {
    if (window.confirm('This will reset stats to automatically calculated values from results. Continue?')) {
      const calculatedStats = calculateStatsFromResults();
      setStats(calculatedStats);
      setTempStats(calculatedStats);
      localStorage.removeItem('rugbyStatsManuallyEdited');
      setIsEditingStats(false);
    }
  };

  const statsDisplay = [
    { label: 'Games Played', value: stats.gamesPlayed, icon: FiActivity, key: 'gamesPlayed', color: 'text-blue-600' },
    { label: 'Wins', value: stats.wins, icon: FiCheckCircle, key: 'wins', color: 'text-green-600' },
    { label: 'Points For', value: stats.pointsFor, icon: FiTarget, key: 'pointsFor', color: 'text-green-600' },
    { label: 'Points Against', value: stats.pointsAgainst, icon: FiMinus, key: 'pointsAgainst', color: 'text-red-600' },
  ];

  const quickLinks = [
    { title: 'Next Match', description: 'View upcoming fixtures', link: '/fixtures', icon: FiCalendar, color: 'bg-green-600' },
    { title: 'Latest Results', description: 'Check recent match results', link: '/results', icon: FiTrendingUp, color: 'bg-gray-700' },
    { title: 'Photo Gallery', description: 'Browse match photos', link: '/gallery', icon: FiCamera, color: 'bg-green-500' },
    { title: 'Team Squad', description: 'Meet the players', link: '/team', icon: FiUsers, color: 'bg-gray-600' },
  ];

  // Check if user is admin
  const isAdmin = localStorage.getItem('rugbyAdminAuth') === 'true';
  const hasManualEdits = localStorage.getItem('rugbyStatsManuallyEdited') === 'true';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Sullivan Upper Rugby
        </h1>
        <p className="text-xl text-green-600 mb-2 font-semibold">Medallion Shield Campaign 2025/26</p>
        <p className="text-lg text-gray-600">Following our journey preparing for Ulster's premier schools under 15 rugby competition</p>
      </motion.div>

      {/* Next Fixture Countdown */}
      <FixtureCountdown />

      {/* Season Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Season Stats</h2>
          {isAdmin && (
            <div className="flex space-x-2">
              {isEditingStats ? (
                <>
                  <button
                    onClick={handleSaveStats}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiSave} className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleResetToCalculated}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Reset to Auto
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingStats(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                  <span>Edit Stats</span>
                </button>
              )}
            </div>
          )}
        </div>

        {hasManualEdits && isAdmin && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> These stats have been manually edited and won't auto-update from results.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-green-600">
              <SafeIcon icon={stat.icon} className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
              {isEditingStats ? (
                <input
                  type="number"
                  value={tempStats[stat.key]}
                  onChange={(e) => setTempStats({ ...tempStats, [stat.key]: parseInt(e.target.value) || 0 })}
                  className="text-3xl font-bold text-gray-800 mb-1 w-full text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                />
              ) : (
                <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
              )}
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            to={link.link}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group border-l-4 border-green-600"
          >
            <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <SafeIcon icon={link.icon} className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{link.title}</h3>
            <p className="text-gray-600 text-sm">{link.description}</p>
          </Link>
        ))}
      </motion.div>

      {/* Ulster Rugby Fact */}
      <UlsterRugbyFact />

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg shadow-md p-8 border-l-4 border-green-600 mt-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">About the Medallion Shield</h2>
        <p className="text-gray-600 mb-4">
          The Medallion Shield is one of Ulster's most prestigious schools rugby competitions, featuring the finest young rugby talent from across the province. This season represents a crucial year for our squad as they compete against the best schools in Ulster.
        </p>
        <p className="text-gray-600">
          Follow Sullivan Upper's journey through this exciting season with match updates, results, photos, and team news all in one place.
        </p>
      </motion.div>
    </div>
  );
};

export default Home;