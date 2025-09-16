import { useState, useEffect, useRef } from 'react'
import supabase from '../lib/supabase'

// Table name mapping
const getTableName = (baseTable) => {
  const tableMap = {
    'fixtures': 'fixtures_rugby12345',
    'results': 'results_rugby12345', 
    'players': 'players_rugby12345',
    'coaches': 'coaches_rugby12345',
    'media': 'media_rugby12345',
    'stats': 'stats_rugby12345'
  }
  return tableMap[baseTable] || baseTable
}

// Transform data from Supabase to frontend format
const transformSupabaseToFrontend = (item, baseTable) => {
  let transformedItem = { ...item };
  
  if (baseTable === 'fixtures' && item.home_away) {
    transformedItem.homeAway = item.home_away;
    delete transformedItem.home_away;
  }
  
  if (baseTable === 'results') {
    if (item.home_away) {
      transformedItem.homeAway = item.home_away;
      delete transformedItem.home_away;
    }
    if (item.sullivan_score !== undefined) {
      transformedItem.sullivanScore = item.sullivan_score;
      delete transformedItem.sullivan_score;
    }
    if (item.opponent_score !== undefined) {
      transformedItem.opponentScore = item.opponent_score;
      delete transformedItem.opponent_score;
    }
    if (item.match_type) {
      transformedItem.matchType = item.match_type;
      delete transformedItem.match_type;
    }
  }
  
  return transformedItem;
}

export const useSupabaseDataFixed = (baseTable) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 🔧 FIX 1: Use ref to prevent re-subscriptions during form interactions
  const subscriptionRef = useRef(null)
  const isFormInteracting = useRef(false)
  
  // Get the actual table name with suffix
  const table = getTableName(baseTable)
  
  const fetchData = async () => {
    try {
      setLoading(true)
      console.log(`🔄 Fetching data from ${table}...`)
      
      const { data: result, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform the data for frontend use
      const transformedData = result ? result.map(item => 
        transformSupabaseToFrontend(item, baseTable)
      ) : []
      
      console.log(`✅ Fetched ${transformedData.length} items from ${table}`)
      
      // 🔧 FIX 2: Only update state if not actively typing
      if (!isFormInteracting.current) {
        setData(transformedData)
      }
    } catch (err) {
      console.error(`❌ Error fetching data from ${table}:`, err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // 🔧 FIX 3: Debounced real-time subscription
    const setupRealtimeSubscription = () => {
      console.log(`📡 Setting up real-time subscription for ${table}`)
      
      subscriptionRef.current = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table
          },
          (payload) => {
            console.log(`🔔 Real-time update received for ${table}:`, payload.eventType)
            
            // 🔧 FIX 4: Debounce updates when user is typing
            if (isFormInteracting.current) {
              console.log('⏸️ Skipping real-time update - user is interacting with form')
              return
            }
            
            switch (payload.eventType) {
              case 'INSERT':
                const newItem = transformSupabaseToFrontend(payload.new, baseTable)
                setData(prev => {
                  const filtered = prev.filter(item => item.id !== newItem.id)
                  return [newItem, ...filtered]
                })
                console.log(`➕ Added new item to ${table}:`, newItem.id)
                break
                
              case 'UPDATE':
                const updatedItem = transformSupabaseToFrontend(payload.new, baseTable)
                setData(prev => 
                  prev.map(item => 
                    item.id === updatedItem.id ? updatedItem : item
                  )
                )
                console.log(`📝 Updated item in ${table}:`, updatedItem.id)
                break
                
              case 'DELETE':
                setData(prev => prev.filter(item => item.id !== payload.old.id))
                console.log(`🗑️ Deleted item from ${table}:`, payload.old.id)
                break
                
              default:
                console.log(`❓ Unknown event type: ${payload.eventType}`)
            }
          }
        )
        .subscribe((status) => {
          console.log(`📡 Subscription status for ${table}:`, status)
        })
    }

    // Set up subscription after initial fetch
    const subscriptionTimeout = setTimeout(setupRealtimeSubscription, 1000)
    
    // Cleanup function
    return () => {
      clearTimeout(subscriptionTimeout)
      if (subscriptionRef.current) {
        console.log(`🔌 Cleaning up subscription for ${table}`)
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [table, baseTable])

  const addItem = async (item) => {
    try {
      console.log(`➕ Adding item to ${table}:`, item)
      
      // Transform certain fields based on table
      let transformedItem = { ...item }
      
      if (baseTable === 'fixtures') {
        transformedItem = {
          ...transformedItem,
          home_away: item.homeAway,
        }
        delete transformedItem.homeAway
      }
      
      if (baseTable === 'results') {
        transformedItem = {
          ...transformedItem,
          home_away: item.homeAway,
          sullivan_score: item.sullivanScore,
          opponent_score: item.opponentScore,
          match_type: item.matchType || ''
        }
        delete transformedItem.homeAway
        delete transformedItem.sullivanScore
        delete transformedItem.opponentScore
        delete transformedItem.matchType
      }
      
      const { data: result, error } = await supabase
        .from(table)
        .insert([transformedItem])
        .select()
      
      if (error) throw error
      
      const transformedResult = result[0] ? transformSupabaseToFrontend(result[0], baseTable) : null
      console.log(`✅ Successfully added item to ${table}:`, transformedResult?.id)
      
      return transformedResult
    } catch (err) {
      console.error(`❌ Error adding item to ${table}:`, err)
      setError(err.message)
      throw err
    }
  }

  const updateItem = async (id, updates) => {
    try {
      console.log(`📝 Updating item ${id} in ${table}`)
      
      // Transform certain fields based on table
      let transformedUpdates = { ...updates }
      
      if (baseTable === 'fixtures' && updates.homeAway !== undefined) {
        transformedUpdates.home_away = updates.homeAway
        delete transformedUpdates.homeAway
      }
      
      if (baseTable === 'results') {
        if (updates.homeAway !== undefined) {
          transformedUpdates.home_away = updates.homeAway
          delete transformedUpdates.homeAway
        }
        if (updates.sullivanScore !== undefined) {
          transformedUpdates.sullivan_score = updates.sullivanScore
          delete transformedUpdates.sullivanScore
        }
        if (updates.opponentScore !== undefined) {
          transformedUpdates.opponent_score = updates.opponentScore
          delete transformedUpdates.opponentScore
        }
        if (updates.matchType !== undefined) {
          transformedUpdates.match_type = updates.matchType
          delete transformedUpdates.matchType
        }
      }
      
      const { data: result, error } = await supabase
        .from(table)
        .update(transformedUpdates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      
      const transformedResult = result[0] ? transformSupabaseToFrontend(result[0], baseTable) : null
      console.log(`✅ Successfully updated item ${id} in ${table}`)
      
      return transformedResult
    } catch (err) {
      console.error(`❌ Error updating item ${id} in ${table}:`, err)
      setError(err.message)
      throw err
    }
  }

  const deleteItem = async (id) => {
    try {
      console.log(`🗑️ Deleting item ${id} from ${table}`)
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      console.log(`✅ Successfully deleted item ${id} from ${table}`)
    } catch (err) {
      console.error(`❌ Error deleting item ${id} from ${table}:`, err)
      setError(err.message)
      throw err
    }
  }

  // 🔧 FIX 5: Form interaction helpers
  const setFormInteracting = (interacting) => {
    isFormInteracting.current = interacting
  }

  return { 
    data, 
    loading, 
    error, 
    addItem, 
    updateItem, 
    deleteItem, 
    refetch: fetchData,
    setFormInteracting // Export this for components to use
  }
}