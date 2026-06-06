import { useState, useEffect } from 'react'
import { createClient, type Insert, type Update } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useAppStore } from '@/store/appStore'
import { Note } from '@/types'

export function useNotes() {
  const { user } = useAuth()
  const { notes, setNotes, addNote, updateNote, deleteNote } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchNotes = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('note_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notes:', error)
      } else {
        setNotes(data)
      }
      setLoading(false)
    }

    fetchNotes()
  }, [user, setNotes])

  const createNote = async (noteData: Insert<'notes'>) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...noteData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    addNote(data as Note)
    return data
  }

  const editNote = async (id: string, updates: Update<'notes'>) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    updateNote(data as Note)
    return data
  }

  const removeNote = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('notes').delete().eq('id', id)

    if (error) throw error
    deleteNote(id)
  }

  const searchNotes = (query: string) => {
    if (!query.trim()) return notes
    const lowerQuery = query.toLowerCase()
    return notes.filter(
      (note) =>
        (note.title?.toLowerCase().includes(lowerQuery) || false) ||
        (note.content?.toLowerCase().includes(lowerQuery) || false)
    )
  }

  const getNotesByDate = (date: string) => {
    return notes.filter((note) => note.note_date === date)
  }

  const getNotesByMonth = (year: number, month: number) => {
    return notes.filter((note) => {
      const noteDate = new Date(note.note_date)
      return noteDate.getFullYear() === year && noteDate.getMonth() === month
    })
  }

  return {
    notes,
    loading,
    createNote,
    editNote,
    removeNote,
    searchNotes,
    getNotesByDate,
    getNotesByMonth,
  }
}