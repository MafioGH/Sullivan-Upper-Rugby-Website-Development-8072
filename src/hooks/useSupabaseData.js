import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

export const useSupabaseData = (table) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data: result, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setData(result || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [table])

  const addItem = async (item) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([item])
        .select()
      
      if (error) throw error
      setData(prev => [result[0], ...prev])
      return result[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateItem = async (id, updates) => {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      setData(prev => prev.map(item => item.id === id ? result[0] : item))
      return result[0]
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setData(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    data,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refetch: fetchData
  }
}