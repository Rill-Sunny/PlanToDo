import { useState, useEffect } from 'react'
import { createClient, type Insert, type Update } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useAppStore } from '@/store/appStore'
import { MemorialEvent } from '@/types'

export function useMemorialEvents() {
  const { user } = useAuth()
  const { memorialEvents, setMemorialEvents, addMemorialEvent, updateMemorialEvent, deleteMemorialEvent } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchEvents = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('memorial_events')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) {
        console.error('Error fetching memorial events:', error)
      } else {
        setMemorialEvents(data)
      }
      setLoading(false)
    }

    fetchEvents()
  }, [user, setMemorialEvents])

  const createEvent = async (eventData: Insert<'memorial_events'>) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('memorial_events')
      .insert({
        ...eventData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    addMemorialEvent(data as MemorialEvent)
    return data
  }

  const editEvent = async (id: string, updates: Update<'memorial_events'>) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('memorial_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    updateMemorialEvent(data as MemorialEvent)
    return data
  }

  const removeEvent = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('memorial_events').delete().eq('id', id)

    if (error) throw error
    deleteMemorialEvent(id)
  }

  const getDaysUntil = (eventDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const targetDate = new Date(eventDate)
    targetDate.setHours(0, 0, 0, 0)
    
    const diffTime = targetDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getDaysPassed = (eventDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const targetDate = new Date(eventDate)
    targetDate.setHours(0, 0, 0, 0)
    
    const diffTime = today.getTime() - targetDate.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  const upcomingEvents = memorialEvents.filter((event) => {
    const daysUntil = getDaysUntil(event.event_date)
    return daysUntil >= 0
  }).sort((a, b) => getDaysUntil(a.event_date) - getDaysUntil(b.event_date))

  const passedEvents = memorialEvents.filter((event) => {
    return getDaysUntil(event.event_date) < 0
  }).sort((a, b) => getDaysPassed(b.event_date) - getDaysPassed(a.event_date))

  return {
    memorialEvents,
    upcomingEvents,
    passedEvents,
    loading,
    createEvent,
    editEvent,
    removeEvent,
    getDaysUntil,
    getDaysPassed,
  }
}