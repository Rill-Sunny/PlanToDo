import { useState, useEffect } from 'react'
import { createClient, type Insert, type Update } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useAppStore } from '@/store/appStore'
import { Goal } from '@/types'

export function useGoals() {
  const { user } = useAuth()
  const { goals, setGoals, addGoal, updateGoal, deleteGoal } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchGoals = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching goals:', error)
      } else {
        setGoals(data)
      }
      setLoading(false)
    }

    fetchGoals()
  }, [user, setGoals])

  const createGoal = async (goalData: Insert<'goals'>) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const { data, error } = await supabase
      .from('goals')
      .insert({
        ...goalData,
        user_id: user.id,
        current_minutes: 0,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    addGoal(data as Goal)
    return data
  }

  const addGoalTime = async (goalId: string, minutes: number) => {
    const supabase = createClient()

    await supabase.from('goal_logs').insert({
      goal_id: goalId,
      minutes,
      source: 'manual',
    })

    const { data: updatedGoal, error } = await supabase
      .from('goals')
      .update({
        current_minutes: supabase.raw('current_minutes + ?', minutes),
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single()

    if (error) throw error
    updateGoal(updatedGoal as Goal)
    return updatedGoal
  }

  const updateGoalStatus = async (id: string, status: Goal['status']) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('goals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    updateGoal(data as Goal)
    return data
  }

  const updateGoalDetails = async (id: string, updates: Update<'goals'>) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('goals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    updateGoal(data as Goal)
    return data
  }

  const removeGoal = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('goals').delete().eq('id', id)

    if (error) throw error
    deleteGoal(id)
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  const getProgress = (goal: Goal) => {
    if (goal.target_minutes === 0) return 0
    return Math.min((goal.current_minutes / goal.target_minutes) * 100, 100)
  }

  return {
    goals,
    activeGoals,
    completedGoals,
    loading,
    createGoal,
    addGoalTime,
    updateGoalStatus,
    updateGoalDetails,
    removeGoal,
    getProgress,
  }
}