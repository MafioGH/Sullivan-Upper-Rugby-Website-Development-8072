import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiCalendar, FiMapPin, FiClock, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } = FiIcons;

const Fixtures = () => {
  const [fixtures, setFixtures] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFixture, setEditingFixture] = useState(null);
  const [newFixture, setNewFixture] = useState({
    opponent: '',
    date: '',
    time: '',
    venue: '',
    homeAway: 'Home',
    competition: 'Medallion Shield'
  });

  // Load fixtures from localStorage on component mount
  useEffect(() => {
    const savedFixtures = localStorage.getItem('rugbyFixtures');
    if (savedFixtures) {
      setFixtures(JSON.parse(savedFixtures));
    } else {
      // Default fixtures if none exist
      const defaultFixtures = [
        {
          id: 1,
          opponent: 'Royal Belfast Academical Institution',
          date: '2025-02-15',
          time: '14:30',
          venue: 'Sullivan Upper School',
          homeAway: 'Home',
          competition: 'Medallion Shield - Round 1'
        },
        {
          id: 2,
          opponent: 'Methodist College Belfast',
          date: '2025-02-22',
          time: '15:00',
          venue: 'Methody Rugby Ground',
          homeAway: 'Away',
          competition: 'Medallion Shield - Round 2'
        },
        {
          id: 3,
          opponent: 'Campbell College',
          date: '2025-03-01',
          time: '14:30',
          venue: 'Sullivan Upper School',
          homeAway: 'Home',
          competition: 'Medallion Shield - Round 3'
        }
      ];
      setFixtures(defaultFixtures);
      localStorage.setItem('rugbyFixtures', JSON.stringify(defaultFixtures));
    }
  }, []);

  // Save fixtures to localStorage whenever fixtures change
  useEffect(() => {
    localStorage.setItem('rugbyFixtures', JSON.stringify(fixtures));
  }, [fixtures]);

  const handleAddFixture = (e) => {
    e.preventDefault();
    const fixture = {
      id: Date.now(),
      ...newFixture
    };
    setFixtures([...fixtures, fixture]);
    setNewFixture({
      opponent: '',
      date: '',
      time: '',
      venue: '',
      homeAway: 'Home',
      competition: 'Medallion Shield'
    });
    setShowAddForm(false);
  };

  const handleEditFixture = (fixture) => {
    setEditingFixture(fixture.id);
    setNewFixture({
      opponent: fixture.opponent,
      date: fixture.date,
      time: fixture.time,
      venue: fixture.venue,
      homeAway: fixture.homeAway,
      competition: fixture.competition
    });
  };

  const handleUpdateFixture = (e) => {
    e.preventDefault();
    setFixtures(fixtures.map(f => 
      f.id === editingFixture ? { ...f, ...newFixture } : f
    ));
    setEditingFixture(null);
    setNewFixture({
      opponent: '',
      date: '',
      time: '',
      venue: '',
      homeAway: 'Home',
      competition: 'Medallion Shield'
    });
  };

  const handleDeleteFixture = (id, opponent) => {
    if (window.confirm(`Are you sure you want to delete the fixture against ${opponent}? This action cannot be undone.`)) {
      setFixtures(fixtures.filter(f => f.id !== id));
    }
  };

  const handleCancelEdit = () => {
    setEditingFixture(null);
    setShowAddForm(false);
    setNewFixture({
      opponent: '',
      date: '',
      time: '',
      venue: '',
      homeAway: 'Home',
      competition: 'Medallion Shield'
    });
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  // Check if user is admin
  const isAdmin = localStorage.getItem('rugbyAdminAuth') === 'true';

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
                value={newFixture.opponent}
                onChange={(e) => setNewFixture({ ...newFixture, opponent: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newFixture.date}
                onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={newFixture.time}
                onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Home/Away</label>
              <select
                value={newFixture.homeAway}
                onChange={(e) => setNewFixture({ ...newFixture, homeAway: e.target.value })}
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
                value={newFixture.venue}
                onChange={(e) => setNewFixture({ ...newFixture, venue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Competition</label>
              <input
                type="text"
                value={newFixture.competition}
                onChange={(e) => setNewFixture({ ...newFixture, competition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
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

      {/* Fixtures List */}
      <div className="space-y-4">
        {fixtures.map((fixture, index) => (
          <motion.div
            key={fixture.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg shadow-md p-6 ${
              isUpcoming(fixture.date) ? 'border-l-4 border-blue-500' : 'opacity-75'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Sullivan Upper vs {fixture.opponent}
                </h3>
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
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  fixture.homeAway === 'Home' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
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
        ))}
      </div>

      {fixtures.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiCalendar} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No fixtures scheduled yet</p>
        </div>
      )}
    </div>
  );
};

export default Fixtures;