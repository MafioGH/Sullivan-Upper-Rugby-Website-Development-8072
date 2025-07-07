import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import AdminAuth from '../components/AdminAuth';

const { FiSettings, FiDatabase, FiDownload, FiUpload, FiTrash2, FiSave, FiShield } = FiIcons;

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

  const [backupData, setBackupData] = useState(null);

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('rugbySettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    const data = {
      settings,
      players: JSON.parse(localStorage.getItem('rugbyPlayers') || '[]'),
      fixtures: JSON.parse(localStorage.getItem('rugbyFixtures') || '[]'),
      results: JSON.parse(localStorage.getItem('rugbyResults') || '[]'),
      media: JSON.parse(localStorage.getItem('rugbyMedia') || '[]')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sullivan-upper-rugby-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setBackupData(data);
        } catch (error) {
          alert('Error reading backup file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRestoreData = () => {
    if (backupData) {
      if (window.confirm('This will overwrite all current data. Are you sure?')) {
        localStorage.setItem('rugbySettings', JSON.stringify(backupData.settings || {}));
        localStorage.setItem('rugbyPlayers', JSON.stringify(backupData.players || []));
        localStorage.setItem('rugbyFixtures', JSON.stringify(backupData.fixtures || []));
        localStorage.setItem('rugbyResults', JSON.stringify(backupData.results || []));
        localStorage.setItem('rugbyMedia', JSON.stringify(backupData.media || []));
        setSettings(backupData.settings || settings);
        alert('Data restored successfully! Please refresh the page to see changes.');
      }
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('This will permanently delete all data. Are you sure?')) {
      if (window.confirm('This action cannot be undone. Continue?')) {
        localStorage.removeItem('rugbySettings');
        localStorage.removeItem('rugbyPlayers');
        localStorage.removeItem('rugbyFixtures');
        localStorage.removeItem('rugbyResults');
        localStorage.removeItem('rugbyMedia');
        alert('All data cleared successfully! Please refresh the page.');
      }
    }
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

        {/* Website Settings */}
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

        {/* Data Management */}
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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Backup Data</h3>
              <p className="text-gray-600 mb-3">Export all your data (players, fixtures, results, media) to a backup file.</p>
              <button
                onClick={handleExportData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                <span>Export Data</span>
              </button>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Restore Data</h3>
              <p className="text-gray-600 mb-3">Import data from a backup file to restore your website.</p>
              <div className="flex space-x-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 cursor-pointer"
                >
                  <SafeIcon icon={FiUpload} className="w-4 h-4" />
                  <span>Select Backup File</span>
                </label>
                {backupData && (
                  <button
                    onClick={handleRestoreData}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Restore Data
                  </button>
                )}
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-gray-600 mb-3">Permanently delete all data. This action cannot be undone.</p>
              <button
                onClick={handleClearAllData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </motion.div>

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
            <p><strong>Admin Access:</strong> This panel is password-protected. Your session will expire after 24 hours for security.</p>
            <p><strong>Password:</strong> The default admin password is "SullivanRugby2025". You can change this in the AdminAuth.jsx file.</p>
            <p><strong>Data Storage:</strong> All data is stored locally in the browser. Regular backups are recommended.</p>
            <p><strong>Adding Media:</strong> Use image URLs from services like Unsplash or upload to a cloud service and use the direct link.</p>
            <p><strong>Video URLs:</strong> For YouTube videos, use the embed URL format: https://www.youtube.com/embed/VIDEO_ID</p>
          </div>
        </motion.div>
      </div>
    </AdminAuth>
  );
};

export default Admin;