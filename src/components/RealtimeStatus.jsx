import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../common/SafeIcon'
import supabase from '../lib/supabase'

const { FiWifi, FiWifiOff, FiRefreshCw } = FiIcons

const RealtimeStatus = () => {
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    // Monitor connection status
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('fixtures_rugby12345')
          .select('count')
          .limit(1)
        
        if (error) throw error
        setIsConnected(true)
      } catch (err) {
        console.error('Connection check failed:', err)
        setIsConnected(false)
      }
    }

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    
    // Initial check
    checkConnection()

    // Listen for any real-time updates to show activity
    const subscription = supabase
      .channel('connection_monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixtures_rugby12345'
        },
        () => {
          setLastUpdate(new Date())
          setIsConnected(true)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'results_rugby12345'
        },
        () => {
          setLastUpdate(new Date())
          setIsConnected(true)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players_rugby12345'
        },
        () => {
          setLastUpdate(new Date())
          setIsConnected(true)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'media_rugby12345'
        },
        () => {
          setLastUpdate(new Date())
          setIsConnected(true)
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-4 z-40"
    >
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
        isConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        <SafeIcon 
          icon={isConnected ? FiWifi : FiWifiOff} 
          className={`w-4 h-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} 
        />
        <span className={`text-sm font-medium ${
          isConnected ? 'text-green-700' : 'text-red-700'
        }`}>
          {isConnected ? 'Live Sync' : 'Offline'}
        </span>
        {lastUpdate && (
          <span className="text-xs text-gray-500">
            {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default RealtimeStatus