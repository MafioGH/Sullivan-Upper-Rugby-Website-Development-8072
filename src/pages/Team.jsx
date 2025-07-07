import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiUser, FiPlus, FiEdit2, FiTrash2, FiAward, FiTarget, FiUsers, FiSave, FiX } = FiIcons;

const Team = () => {
  const [players, setPlayers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    position: '',
    number: '',
    age: '',
    height: '',
    weight: '',
    photo: '',
    captain: false
  });

  const positions = [
    'Prop', 'Hooker', 'Lock', 'Flanker', 'Number 8', 'Scrum-Half', 'Fly-Half', 'Centre', 'Wing', 'Full-Back'
  ];

  // Load players from localStorage on component mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('rugbyPlayers');
    if (savedPlayers) {
      try {
        const parsedPlayers = JSON.parse(savedPlayers);
        setPlayers(parsedPlayers);
      } catch (error) {
        console.error('Error parsing saved players:', error);
        // Set default players if parsing fails
        setDefaultPlayers();
      }
    } else {
      // Set default players if none exist
      setDefaultPlayers();
    }
  }, []);

  const setDefaultPlayers = () => {
    const defaultPlayers = [
      {
        id: 1,
        name: 'James Wilson',
        position: 'Fly-Half',
        number: 10,
        age: 14,
        height: '5\'8"',
        weight: '65kg',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        captain: true,
        stats: { tries: 0, conversions: 0, penalties: 0 }
      },
      {
        id: 2,
        name: 'Michael Thompson',
        position: 'Scrum-Half',
        number: 9,
        age: 14,
        height: '5\'6"',
        weight: '60kg',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        captain: false,
        stats: { tries: 0, conversions: 0, penalties: 0 }
      },
      {
        id: 3,
        name: 'David Roberts',
        position: 'Lock',
        number: 4,
        age: 14,
        height: '6\'2"',
        weight: '75kg',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
        captain: false,
        stats: { tries: 0, conversions: 0, penalties: 0 }
      }
    ];
    setPlayers(defaultPlayers);
    localStorage.setItem('rugbyPlayers', JSON.stringify(defaultPlayers));
  };

  // Save players to localStorage whenever players change
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('rugbyPlayers', JSON.stringify(players));
    }
  }, [players]);

  const handleAddPlayer = (e) => {
    e.preventDefault();
    const player = {
      id: Date.now(),
      ...newPlayer,
      number: newPlayer.number ? parseInt(newPlayer.number) : null,
      age: parseInt(newPlayer.age),
      stats: { tries: 0, conversions: 0, penalties: 0 }
    };
    const updatedPlayers = [...players, player];
    setPlayers(updatedPlayers);
    localStorage.setItem('rugbyPlayers', JSON.stringify(updatedPlayers));
    setNewPlayer({
      name: '',
      position: '',
      number: '',
      age: '',
      height: '',
      weight: '',
      photo: '',
      captain: false
    });
    setShowAddForm(false);
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player.id);
    setNewPlayer({
      name: player.name,
      position: player.position,
      number: player.number ? player.number.toString() : '',
      age: player.age.toString(),
      height: player.height || '',
      weight: player.weight || '',
      photo: player.photo,
      captain: player.captain
    });
  };

  const handleUpdatePlayer = (e) => {
    e.preventDefault();
    const updatedPlayers = players.map(p =>
      p.id === editingPlayer
        ? {
            ...p,
            ...newPlayer,
            number: newPlayer.number ? parseInt(newPlayer.number) : null,
            age: parseInt(newPlayer.age)
          }
        : p
    );
    setPlayers(updatedPlayers);
    localStorage.setItem('rugbyPlayers', JSON.stringify(updatedPlayers));
    setEditingPlayer(null);
    setNewPlayer({
      name: '',
      position: '',
      number: '',
      age: '',
      height: '',
      weight: '',
      photo: '',
      captain: false
    });
  };

  const handleDeletePlayer = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      const updatedPlayers = players.filter(p => p.id !== id);
      setPlayers(updatedPlayers);
      localStorage.setItem('rugbyPlayers', JSON.stringify(updatedPlayers));
    }
  };

  const handleCancelEdit = () => {
    setEditingPlayer(null);
    setShowAddForm(false);
    setNewPlayer({
      name: '',
      position: '',
      number: '',
      age: '',
      height: '',
      weight: '',
      photo: '',
      captain: false
    });
  };

  const sortedPlayers = [...players].sort((a, b) => {
    // Sort by number if both have numbers, otherwise by name
    if (a.number && b.number) return a.number - b.number;
    if (a.number && !b.number) return -1;
    if (!a.number && b.number) return 1;
    return a.name.localeCompare(b.name);
  });

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
          Team Squad
        </motion.h1>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="w-4 h-4" />
            <span>Add Player</span>
          </button>
        )}
      </div>

      {/* Permission Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
      >
        <p className="text-sm text-green-700">
          All player information and photos are shared with appropriate permissions from players and parents/guardians.
        </p>
      </motion.div>

      {/* Add/Edit Player Form */}
      {(showAddForm || editingPlayer) && isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {editingPlayer ? 'Edit Player' : 'Add New Player'}
          </h2>
          <form onSubmit={editingPlayer ? handleUpdatePlayer : handleAddPlayer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <select
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Position</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jersey Number (Optional)</label>
              <input
                type="number"
                value={newPlayer.number}
                onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="99"
                placeholder="Leave empty if no number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                value={newPlayer.age}
                onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="13"
                max="18"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (Optional)</label>
              <input
                type="text"
                value={newPlayer.height}
                onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5'10&quot;"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Optional)</label>
              <input
                type="text"
                value={newPlayer.weight}
                onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 70kg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
              <input
                type="url"
                value={newPlayer.photo}
                onChange={(e) => setNewPlayer({ ...newPlayer, photo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="captain"
                checked={newPlayer.captain}
                onChange={(e) => setNewPlayer({ ...newPlayer, captain: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="captain" className="text-sm font-medium text-gray-700">Team Captain</label>
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>{editingPlayer ? 'Update Player' : 'Add Player'}</span>
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

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={player.photo || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face`}
                alt={player.name}
                className="w-full h-48 object-cover"
              />
              {player.number && (
                <div className="absolute top-2 left-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    #{player.number}
                  </span>
                </div>
              )}
              {player.captain && (
                <div className="absolute top-2 right-2">
                  <SafeIcon icon={FiAward} className="w-6 h-6 text-yellow-500" />
                </div>
              )}
              {isAdmin && (
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEditPlayer(player)}
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(player.id, player.name)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{player.name}</h3>
              <p className="text-blue-600 font-medium mb-2">{player.position}</p>
              {player.captain && (
                <p className="text-yellow-600 font-medium text-sm mb-2">Team Captain</p>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <div>Age: {player.age}</div>
                {player.height && <div>Height: {player.height}</div>}
                {player.weight && <div className={player.height ? "col-span-2" : ""}>Weight: {player.weight}</div>}
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">Season Stats</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-gray-800">{player.stats?.tries || 0}</div>
                    <div className="text-gray-600">Tries</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-800">{player.stats?.conversions || 0}</div>
                    <div className="text-gray-600">Conv.</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-800">{player.stats?.penalties || 0}</div>
                    <div className="text-gray-600">Pen.</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {players.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiUsers} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No players added yet</p>
          <p className="text-gray-400">Add players to build your team roster</p>
        </div>
      )}
    </div>
  );
};

export default Team;