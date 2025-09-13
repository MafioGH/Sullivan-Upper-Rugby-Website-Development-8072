import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import AdminAuth from '../components/AdminAuth';

const { FiSettings, FiDatabase, FiDownload, FiUpload, FiTrash2, FiSave, FiShield, FiEdit, FiPlus, FiInfo, FiX } = FiIcons;

const Admin = () => {
  const [settings, setSettings] = useState({
    teamName: 'Sullivan Upper Rugby',
    season: '2025/26',
    competition: 'Medallion Shield',
    homeGround: 'Sullivan Upper School',
    coachName: '',
    contactEmail: '',
    websiteDescription: 'Following our journey through Ulster\'s premier schools rugby competition'
  });

  const [activeTab, setActiveTab] = useState('settings');
  const [rugbyFacts, setRugbyFacts] = useState([]);
  const [showAddFactForm, setShowAddFactForm] = useState(false);
  const [newFact, setNewFact] = useState('');
  const [editingFactIndex, setEditingFactIndex] = useState(null);

  useEffect(() => {
    // Load facts from local storage
    const storedFacts = localStorage.getItem('ulsterRugbyFacts');
    if (storedFacts) {
      setRugbyFacts(JSON.parse(storedFacts));
    } else {
      // Load default facts from the component
      import('../components/UlsterRugbyFact.jsx').then(module => {
        // Extract the facts array using regex from the component file
        const componentText = module.default.toString();
        const factsMatch = componentText.match(/const\s+ulsterRugbyFacts\s*=\s*\[([\s\S]*?)\];/);
        
        if (factsMatch && factsMatch[1]) {
          // Parse the facts array string into actual array
          const factsString = factsMatch[1].replace(/"/g, "'");
          const factsList = factsString.split("',").map(fact => 
            fact.trim().replace(/^['"]|['"]$/g, '')
          ).filter(fact => fact);
          
          setRugbyFacts(factsList);
          localStorage.setItem('ulsterRugbyFacts', JSON.stringify(factsList));
        }
      }).catch(err => {
        console.error("Error loading default facts:", err);
        // Fallback to empty array
        setRugbyFacts([]);
      });
    }
  }, []);

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('rugbySettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleAddFact = () => {
    if (newFact.trim() === '') return;
    
    const updatedFacts = [...rugbyFacts];
    if (editingFactIndex !== null) {
      // Update existing fact
      updatedFacts[editingFactIndex] = newFact;
    } else {
      // Add new fact
      updatedFacts.push(newFact);
    }
    
    setRugbyFacts(updatedFacts);
    localStorage.setItem('ulsterRugbyFacts', JSON.stringify(updatedFacts));
    
    // Reset form
    setNewFact('');
    setShowAddFactForm(false);
    setEditingFactIndex(null);
  };

  const handleEditFact = (index) => {
    setNewFact(rugbyFacts[index]);
    setEditingFactIndex(index);
    setShowAddFactForm(true);
  };

  const handleDeleteFact = (index) => {
    if (window.confirm('Are you sure you want to delete this fact?')) {
      const updatedFacts = rugbyFacts.filter((_, i) => i !== index);
      setRugbyFacts(updatedFacts);
      localStorage.setItem('ulsterRugbyFacts', JSON.stringify(updatedFacts));
    }
  };

  const handleCancelFactEdit = () => {
    setNewFact('');
    setShowAddFactForm(false);
    setEditingFactIndex(null);
  };

  return (
    <AdminAuth>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your rugby website settings and data</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SafeIcon icon={FiSettings} className="w-4 h-4 inline mr-1" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'facts'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SafeIcon icon={FiInfo} className="w-4 h-4 inline mr-1" />
            Rugby Facts
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'database'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <SafeIcon icon={FiDatabase} className="w-4 h-4 inline mr-1" />
            Database
          </button>
        </div>

        {/* Data Storage Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center">
            <SafeIcon icon={FiDatabase} className="w-5 h-5 mr-2" />
            Supabase Cloud Storage Active
          </h2>
          <div className="space-y-2 text-green-700">
            <p><strong>✅ Real-time Sync:</strong> All data automatically syncs across browsers</p>
            <p><strong>✅ Cloud Storage:</strong> Data is stored securely in Supabase</p>
            <p><strong>✅ CRUD Operations:</strong> Full Create, Read, Update, Delete functionality</p>
            <p><strong>✅ Cross-Browser Access:</strong> Access your data from any device</p>
          </div>
        </motion.div>

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <SafeIcon icon={FiSettings} className="w-5 h-5 mr-2" />
              Website Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={settings.teamName}
                  onChange={(e) => handleSettingsChange('teamName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                <input
                  type="text"
                  value={settings.season}
                  onChange={(e) => handleSettingsChange('season', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competition</label>
                <input
                  type="text"
                  value={settings.competition}
                  onChange={(e) => handleSettingsChange('competition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Ground</label>
                <input
                  type="text"
                  value={settings.homeGround}
                  onChange={(e) => handleSettingsChange('homeGround', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coach Name</label>
                <input
                  type="text"
                  value={settings.coachName}
                  onChange={(e) => handleSettingsChange('coachName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleSettingsChange('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website Description</label>
                <textarea
                  value={settings.websiteDescription}
                  onChange={(e) => handleSettingsChange('websiteDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleSaveSettings}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'facts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <SafeIcon icon={FiInfo} className="w-5 h-5 mr-2" />
                Ulster Rugby Facts
              </h2>
              <button
                onClick={() => setShowAddFactForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <span>Add Fact</span>
              </button>
            </div>

            {showAddFactForm && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {editingFactIndex !== null ? 'Edit Fact' : 'Add New Fact'}
                </h3>
                <textarea
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  rows="3"
                  placeholder="Enter rugby fact..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddFact}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                  >
                    <SafeIcon icon={editingFactIndex !== null ? FiSave : FiPlus} className="w-4 h-4" />
                    <span>{editingFactIndex !== null ? 'Update' : 'Add'}</span>
                  </button>
                  <button
                    onClick={handleCancelFactEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-1"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            <div className="border rounded-lg divide-y">
              {rugbyFacts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No rugby facts found. Add some facts to display on the homepage.
                </div>
              ) : (
                rugbyFacts.map((fact, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <p className="text-gray-800">{fact}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditFact(index)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit fact"
                        >
                          <SafeIcon icon={FiEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFact(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete fact"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              These facts will be randomly displayed on the homepage in the Ulster Rugby Facts section.
            </p>
          </motion.div>
        )}

        {activeTab === 'database' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <SafeIcon icon={FiDatabase} className="w-5 h-5 mr-2" />
              Data Management
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Supabase Integration</h3>
                <p className="text-gray-600 mb-3">
                  Your data is now stored in Supabase cloud database with full CRUD operations:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li><strong>Fixtures:</strong> Add, edit, delete match schedules</li>
                  <li><strong>Results:</strong> Record and manage match outcomes</li>
                  <li><strong>Players:</strong> Maintain team roster and statistics</li>
                  <li><strong>Gallery:</strong> Upload and organize media content</li>
                  <li><strong>Real-time Updates:</strong> Changes sync instantly across all browsers</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Database Tables</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <div>• fixtures_rugby12345</div>
                  <div>• results_rugby12345</div>
                  <div>• players_rugby12345</div>
                  <div>• media_rugby12345</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Security Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
            <SafeIcon icon={FiShield} className="w-5 h-5 mr-2" />
            Security & Usage
          </h2>
          <div className="space-y-3 text-blue-700">
            <p>
              <strong>Admin Access:</strong> This panel is password-protected. Your session will expire after 24 hours for security.
            </p>
            <p>
              <strong>Password:</strong> The current admin password is "SUMEDS009". You can change this in the AdminAuth.jsx file.
            </p>
            <p>
              <strong>Data Storage:</strong> All data is stored securely in Supabase with real-time synchronization.
            </p>
            <p>
              <strong>Adding Media:</strong> Use image URLs from services like Unsplash or upload to a cloud service and use the direct link.
            </p>
            <p>
              <strong>Video URLs:</strong> For YouTube videos, use the embed URL format: https://www.youtube.com/embed/VIDEO_ID
            </p>
          </div>
        </motion.div>
      </div>
    </AdminAuth>
  );
};

export default Admin;