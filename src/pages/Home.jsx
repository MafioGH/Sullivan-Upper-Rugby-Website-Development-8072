import React, {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {Link} from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import FixtureCountdown from '../components/FixtureCountdown';
import UlsterRugbyFact from '../components/UlsterRugbyFact';
import {useSupabaseData} from '../hooks/useSupabaseData';

const {FiTrendingUp, FiCalendar, FiCamera, FiUsers, FiTarget, FiAward, FiActivity, FiMinus, FiCheckCircle} = FiIcons;

const Home = () => {
  const {data: supabaseResults, loading: resultsLoading} = useSupabaseData('results');
  const [stats, setStats] = useState({gamesPlayed: 0, wins: 0, pointsFor: 0, pointsAgainst: 0});

  // Auto-calculate stats from Supabase results
  const calculateStatsFromResults = (results) => {
    if (!results || results.length === 0) {
      return {gamesPlayed: 0, wins: 0, pointsFor: 0, pointsAgainst: 0};
    }
    const calculatedStats = {
      gamesPlayed: results.length,
      wins: results.filter(r => r.sullivanScore > r.opponentScore).length,
      pointsFor: results.reduce((sum, r) => sum + r.sullivanScore, 0),
      pointsAgainst: results.reduce((sum, r) => sum + r.opponentScore, 0)
    };
    return calculatedStats;
  };

  // Calculate stats from Supabase results
  useEffect(() => {
    if (!resultsLoading) {
      const calculatedStats = calculateStatsFromResults(supabaseResults);
      setStats(calculatedStats);
    }
  }, [resultsLoading, supabaseResults]);

  const statsDisplay = [
    {label: 'Games Played', value: stats.gamesPlayed, icon: FiActivity, color: 'text-blue-600'},
    {label: 'Wins', value: stats.wins, icon: FiCheckCircle, color: 'text-green-600'},
    {label: 'Points For', value: stats.pointsFor, icon: FiTarget, color: 'text-green-600'},
    {label: 'Points Against', value: stats.pointsAgainst, icon: FiMinus, color: 'text-red-600'},
  ];

  const quickLinks = [
    {title: 'Next Match', description: 'View upcoming fixtures', link: '/fixtures', icon: FiCalendar, color: 'bg-green-600'},
    {title: 'Latest Results', description: 'Check recent match results', link: '/results', icon: FiTrendingUp, color: 'bg-gray-700'},
    {title: 'Photo Gallery', description: 'Browse match photos', link: '/gallery', icon: FiCamera, color: 'bg-green-500'},
    {title: 'Team Squad', description: 'Meet the players', link: '/team', icon: FiUsers, color: 'bg-gray-600'},
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Sullivan Upper Rugby
        </h1>
        <p className="text-xl text-green-600 mb-2 font-semibold">Medallion Shield Campaign 2025/26</p>
        <p className="text-lg text-gray-600">Following the Sullivan Upper Medallion rugby team's journey preparing for Ulster's premier schools under 15 rugby competition</p>
      </motion.div>

      {/* Next Fixture Countdown */}
      <FixtureCountdown />

      {/* Season Stats */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.2}}
        className="mb-12"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Season Stats</h2>
        </div>
        
        {resultsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-green-600">
                <div className="animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsDisplay.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-green-600">
                <SafeIcon icon={stat.icon} className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.4}}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            to={link.link}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group border-l-4 border-green-600"
          >
            <div
              className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
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
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.6}}
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