import React from 'react';
import { motion } from 'framer-motion';
import PhotoManager from './PhotoManager';
import DatabaseDebugger from '../components/DatabaseDebugger';

const PhotoManagerDebug = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Panel */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
          >
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              🔧 DEBUG MODE: Video Persistence Issue
            </h2>
            <p className="text-yellow-700 text-sm">
              This page includes debugging tools to diagnose why Google Drive videos aren't persisting across browsers/devices.
              The PhotoManager component below is already fixed to use Supabase database instead of localStorage.
            </p>
          </motion.div>
          
          <DatabaseDebugger />
        </div>
      </div>

      {/* Regular PhotoManager */}
      <PhotoManager />
    </div>
  );
};

export default PhotoManagerDebug;