import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useSupabaseData } from '../hooks/useSupabaseData';

const { FiCalendar, FiMapPin, FiClock, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiExternalLink, FiFileText, FiAlertCircle, FiXCircle } = FiIcons;

const Fixtures = () => {
  const { data: fixtures, loading, error, addItem, updateItem, deleteItem } = useSupabaseData('fixtures');
  const { data: results } = useSupabaseData('results');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);

  // 🔧 FIXED: Individual state hooks to prevent object re-rendering
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [homeAway, setHomeAway] = useState('Home');
  const [competition, setCompetition] = useState('Medallion Shield');
  // 🆕 NEW: Cancellation state
  const [cancelled, setCancelled] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // 🔧 FIXED: Stable form handlers
  const handleAddFixture = useCallback(async (e) => {
    e.preventDefault();

    try {
      const fixtureData = {
        opponent,
        date,
        time,
        venue,
        homeAway,
        competition,
        cancelled, // 🆕 NEW: Include cancellation status
        cancellation_reason: cancellationReason // 🆕 NEW: Include cancellation reason
      };

      await addItem(fixtureData);

      // Reset form
      setOpponent('');
      setDate('');
      setTime('');
      setVenue('');
      setHomeAway('Home');
      setCompetition('Medallion Shield');
      setCancelled(false);
      setCancellationReason('');
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding fixture:", error);
      alert("Failed to add fixture. Please try again.");
    }
  }, [opponent, date, time, venue, homeAway, competition, cancelled, cancellationReason, addItem]);

  const handleEditFixture = useCallback((fixture) => {
    setEditingFixture(fixture.id);
    setOpponent(fixture.opponent);
    setDate(fixture.date);
    setTime(fixture.time);
    setVenue(fixture.venue);
    setHomeAway(fixture.homeAway);
    setCompetition(fixture.competition);
    setCancelled(fixture.cancelled || false); // 🆕 NEW: Load cancellation status
    setCancellationReason(fixture.cancellation_reason || ''); // 🆕 NEW: Load cancellation reason
  }, []);

  const handleUpdateFixture = useCallback(async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        opponent,
        date,
        time,
        venue,
        homeAway,
        competition,
        cancelled, // 🆕 NEW: Include cancellation status
        cancellation_reason: cancellationReason // 🆕 NEW: Include cancellation reason
      };

      await updateItem(editingFixture, updateData);
      setEditingFixture(null);

      // Reset form
      setOpponent('');
      setDate('');
      setTime('');
      setVenue('');
      setHomeAway('Home');
      setCompetition('Medallion Shield');
      setCancelled(false);
      setCancellationReason('');
    } catch (error) {
      console.error("Error updating fixture:", error);
      alert("Failed to update fixture. Please try again.");
    }
  }, [editingFixture, opponent, date, time, venue, homeAway, competition, cancelled, cancellationReason, updateItem]);

  const handleDeleteFixture = useCallback(async (id, opponent) => {
    if (window.confirm(`Are you sure you want to delete the fixture against ${opponent}? This action cannot be undone.`)) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error("Error deleting fixture:", error);
        alert("Failed to delete fixture. Please try again.");
      }
    }
  }, [deleteItem]);

  const handleCancelEdit = useCallback(() => {
    setEditingFixture(null);
    setShowAddForm(false);

    // Reset form
    setOpponent('');
    setDate('');
    setTime('');
    setVenue('');
    setHomeAway('Home');
    setCompetition('Medallion Shield');
    setCancelled(false);
    setCancellationReason('');
  }, []);

  // 🔧 FIXED: Proper match completion logic with match duration consideration
  const isMatchCompleted = (date, time) => {
    const now = new Date();
    const matchStartTime = new Date(`${date} ${time}`);
    
    // Rugby matches typically last 80 minutes + stoppage time + halftime = ~120 minutes (2 hours)
    const matchDurationMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const matchEndTime = new Date(matchStartTime.getTime() + matchDurationMs);
    
    return now > matchEndTime;
  };

  // 🔧 FIXED: Consistent upcoming check - match is upcoming if it hasn't been completed AND not cancelled
  const isUpcoming = (date, time, cancelled) => {
    if (cancelled) return false; // 🆕 NEW: Cancelled matches are not upcoming
    return !isMatchCompleted(date, time);
  };

  // Normalize team names for better matching
  const normalizeTeamName = (name) => {
    return name.toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
      // Remove common suffixes and variations
      .replace(/\s+(rugby\s+club|rfc|fc|grammar\s+school|college|school|academy|high\s+school)$/i, '')
      .replace(/\s+(upper|lower|senior|junior)$/i, '')
      // Handle specific cases
      .replace(/dromore\s+rugby\s+club/i, 'dromore')
      .replace(/sullivan\s+upper\s+school/i, 'sullivan upper')
      .replace(/methodist\s+college\s+belfast/i, 'methody')
      .replace(/royal\s+belfast\s+academical\s+institution/i, 'inst')
      .replace(/friends\s+school\s+lisburn/i, 'friends')
      .replace(/campbell\s+college/i, 'campbell')
      .replace(/wallace\s+high\s+school/i, 'wallace');
  };

  // Enhanced function to check if a fixture has a corresponding result
  const hasResult = (fixture) => {
    if (!results || results.length === 0) return false;

    const fixtureDate = fixture.date;
    const normalizedFixtureOpponent = normalizeTeamName(fixture.opponent);

    return results.some(result => {
      // First check if dates match
      if (result.date !== fixtureDate) return false;

      const normalizedResultOpponent = normalizeTeamName(result.opponent);

      // Exact match after normalization
      if (normalizedResultOpponent === normalizedFixtureOpponent) {
        console.log(`✅ Found exact match: "${fixture.opponent}" <-> "${result.opponent}"`);
        return true;
      }

      // Check if one contains the other (for cases like "Dromore" vs "Dromore Rugby Club")
      if (normalizedResultOpponent.includes(normalizedFixtureOpponent) || 
          normalizedFixtureOpponent.includes(normalizedResultOpponent)) {
        console.log(`✅ Found partial match: "${fixture.opponent}" <-> "${result.opponent}"`);
        return true;
      }

      // Check for common abbreviations and variations
      const fixtureWords = normalizedFixtureOpponent.split(' ');
      const resultWords = normalizedResultOpponent.split(' ');

      // If both have multiple words, check if main words match
      if (fixtureWords.length > 1 && resultWords.length > 1) {
        const fixtureMainWord = fixtureWords[0];
        const resultMainWord = resultWords[0];
        if (fixtureMainWord === resultMainWord && fixtureMainWord.length > 3) {
          console.log(`✅ Found main word match: "${fixture.opponent}" <-> "${result.opponent}"`);
          return true;
        }
      }

      return false;
    });
  };

  // Enhanced function to get the result for a fixture
  const getResult = (fixture) => {
    if (!results || results.length === 0) return null;

    const fixtureDate = fixture.date;
    const normalizedFixtureOpponent = normalizeTeamName(fixture.opponent);

    // Try exact match first
    let result = results.find(result => {
      if (result.date !== fixtureDate) return false;
      return normalizeTeamName(result.opponent) === normalizedFixtureOpponent;
    });

    if (result) return result;

    // Try partial match
    result = results.find(result => {
      if (result.date !== fixtureDate) return false;
      const normalizedResultOpponent = normalizeTeamName(result.opponent);
      return normalizedResultOpponent.includes(normalizedFixtureOpponent) || 
             normalizedFixtureOpponent.includes(normalizedResultOpponent);
    });

    if (result) return result;

    // Try main word match for multi-word teams
    result = results.find(result => {
      if (result.date !== fixtureDate) return false;
      const fixtureWords = normalizedFixtureOpponent.split(' ');
      const resultWords = normalizeTeamName(result.opponent).split(' ');

      if (fixtureWords.length > 1 && resultWords.length > 1) {
        const fixtureMainWord = fixtureWords[0];
        const resultMainWord = resultWords[0];
        return fixtureMainWord === resultMainWord && fixtureMainWord.length > 3;
      }
      return false;
    });

    return result;
  };

  // Create anchor ID for a specific match result
  const createMatchAnchorId = (date, opponent) => {
    return `match-${date}-${opponent.toLowerCase().replace(/\s+/g, '-')}`;
  };

  // Sort fixtures chronologically - next fixture first, then future fixtures in date order
  const sortedFixtures = useMemo(() => {
    return [...fixtures].sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB; // Ascending order (earliest first)
    });
  }, [fixtures]);

  // Check if user is admin
  const isAdmin = localStorage.getItem('rugbyAdminAuth') === 'true';

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading fixtures: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-800"
        >
          Fixtures
        </motion.h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Fixture</span>
          </button>
        )}
      </div>

      {/* Add/Edit Fixture Form */}
      {(showAddForm || editingFixture) && isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingFixture ? 'Edit Fixture' : 'Add New Fixture'}
          </h2>
          <form onSubmit={editingFixture ? handleUpdateFixture : handleAddFixture} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opponent</label>
              <input
                type="text"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home/Away</label>
              <select
                value={homeAway}
                onChange={(e) => setHomeAway(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Home">Home</option>
                <option value="Away">Away</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Competition</label>
              <input
                type="text"
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 🆕 NEW: Cancellation Section */}
            <div className="md:col-span-2 mt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center space-x-2">
                  <SafeIcon icon={FiXCircle} className="w-5 h-5" />
                  <span>Match Status</span>
                </h3>
                
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="cancelled"
                    checked={cancelled}
                    onChange={(e) => setCancelled(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="cancelled" className="text-sm font-medium text-red-700">
                    Match Cancelled/Postponed
                  </label>
                </div>

                {cancelled && (
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Wet weather, Unplayable pitch, School closure"
                    />
                    <p className="text-xs text-red-600 mt-1">
                      This reason will be displayed to users when the match is shown as cancelled.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex space-x-4 mt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>{editingFixture ? 'Update Fixture' : 'Add Fixture'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiX} className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Fixtures List - Sorted Chronologically */}
      <div className="space-y-4">
        {sortedFixtures.map((fixture, index) => {
          const isNext = isUpcoming(fixture.date, fixture.time, fixture.cancelled);
          const fixtureDateTime = new Date(`${fixture.date} ${fixture.time}`);
          const isNextFixture = index === 0 && isNext; // First fixture in sorted list that's upcoming
          const fixtureHasResult = hasResult(fixture);
          const matchResult = getResult(fixture);
          const isCompleted = isMatchCompleted(fixture.date, fixture.time);

          return (
            <motion.div
              key={fixture.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-lg shadow-md p-6 ${
                fixture.cancelled 
                  ? 'border-l-4 border-red-500 opacity-75' // 🆕 NEW: Cancelled styling
                  : isNextFixture 
                    ? 'border-l-4 border-green-500 ring-2 ring-green-100' 
                    : isNext 
                      ? 'border-l-4 border-blue-500' 
                      : 'opacity-75 border-l-4 border-gray-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-xl font-bold ${fixture.cancelled ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      Sullivan Upper vs {fixture.opponent}
                    </h3>
                    
                    {/* 🆕 NEW: Cancellation Badge */}
                    {fixture.cancelled && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 animate-pulse">
                        <SafeIcon icon={FiXCircle} className="w-4 h-4 mr-1" />
                        CANCELLED
                      </span>
                    )}
                    
                    {!fixture.cancelled && isNextFixture && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 animate-pulse">
                        NEXT MATCH
                      </span>
                    )}
                    {!fixture.cancelled && isCompleted && !fixtureHasResult && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        COMPLETED
                      </span>
                    )}
                    {!fixture.cancelled && isCompleted && fixtureHasResult && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                        RESULT AVAILABLE
                      </span>
                    )}
                  </div>

                  {/* 🆕 NEW: Cancellation Reason */}
                  {fixture.cancelled && fixture.cancellation_reason && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiAlertCircle} className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-red-700 font-medium">Reason:</span>
                        <span className="text-red-600">{fixture.cancellation_reason}</span>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-2">{fixture.competition}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                      <span>{format(new Date(fixture.date), 'EEEE, MMMM do, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiClock} className="w-4 h-4" />
                      <span>{fixture.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4" />
                      <span>{fixture.venue}</span>
                    </div>
                  </div>

                  {/* Show result score if available and not cancelled */}
                  {!fixture.cancelled && isCompleted && fixtureHasResult && matchResult && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-lg font-bold text-gray-800">
                            Final Score: {matchResult.sullivanScore} - {matchResult.opponentScore}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            matchResult.sullivanScore > matchResult.opponentScore 
                              ? 'bg-green-100 text-green-800' 
                              : matchResult.sullivanScore < matchResult.opponentScore 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {matchResult.sullivanScore > matchResult.opponentScore 
                              ? 'WIN' 
                              : matchResult.sullivanScore < matchResult.opponentScore 
                                ? 'LOSS' 
                                : 'DRAW'}
                          </span>
                        </div>
                        <Link
                          to={`/results#${createMatchAnchorId(matchResult.date, matchResult.opponent)}`}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                        >
                          <SafeIcon icon={FiFileText} className="w-4 h-4" />
                          <span>Read Match Report</span>
                          <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
                        </Link>
                      </div>
                      {matchResult.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">Match Report Preview:</p>
                          <div 
                            className="line-clamp-2 text-gray-700"
                            dangerouslySetInnerHTML={{
                              __html: matchResult.notes.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Simple link to results page for completed fixtures without results - not cancelled */}
                  {!fixture.cancelled && isCompleted && !fixtureHasResult && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiFileText} className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          Results and match description can be found{' '}
                          <Link to="/results" className="font-medium underline hover:no-underline">
                            here
                          </Link>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    fixture.homeAway === 'Home' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {fixture.homeAway}
                  </span>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditFixture(fixture)}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        title="Edit fixture"
                      >
                        <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFixture(fixture.id, fixture.opponent)}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete fixture"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {fixtures.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiCalendar} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No fixtures scheduled yet</p>
        </div>
      )}

      {/* Additional CSS for text truncation */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Fixtures;