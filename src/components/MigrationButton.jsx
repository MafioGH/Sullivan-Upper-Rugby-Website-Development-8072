import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import { migrateLocalStorageToSupabase } from '../utils/migrateData'

const { FiDatabase, FiArrowRight, FiCheck, FiX, FiRefreshCw } = FiIcons

const MigrationButton = () => {
  const [migrating, setMigrating] = useState(false)
  const [migrated, setMigrated] = useState(false)
  const [error, setError] = useState(null)

  const handleMigration = async () => {
    setMigrating(true)
    setError(null)
    
    try {
      console.log("Starting migration process...")
      const success = await migrateLocalStorageToSupabase()
      console.log("Migration completed:", success)
      
      if (success) {
        setMigrated(true)
        // Mark migration as complete
        localStorage.setItem('rugbyDataMigrated', 'true')
        // Force a page refresh to ensure components switch to Supabase mode
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError('Migration failed. Please try again.')
      }
    } catch (err) {
      console.error("Migration error:", err)
      setError('Migration failed: ' + err.message)
    } finally {
      setMigrating(false)
    }
  }

  const handleForceMigration = () => {
    if (window.confirm('This will force enable cloud storage mode. Only do this if your data is already in Supabase. Continue?')) {
      localStorage.setItem('rugbyDataMigrated', 'true')
      window.location.reload()
    }
  }

  if (migrated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-600" />
          <p className="text-green-700">
            <strong>Migration Complete!</strong> Your data is now stored in Supabase and will be accessible from any browser. Page will refresh automatically.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
    >
      <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
        <SafeIcon icon={FiDatabase} className="w-5 h-5 mr-2" />
        Migrate to Cloud Storage
      </h3>
      <p className="text-blue-700 mb-4">
        Your data is currently stored locally in this browser. Migrate it to Supabase to access it from any device or browser.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiX} className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleMigration}
          disabled={migrating}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          {migrating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Migrating...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
              <span>Migrate Data to Cloud</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleForceMigration}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
        >
          <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
          <span>Force Cloud Mode</span>
        </button>
      </div>
    </motion.div>
  )
}

export default MigrationButton