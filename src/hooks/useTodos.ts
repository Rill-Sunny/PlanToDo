import { useState, useEffect } from 'react'
import { createClient, type Insert, type Update } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useAppStore } from '@/store/appStore'
import { Todo } from '@/types'

export function useTodos() {
  const { user } = useAuth()
  const { todos, setTodos, addTodo, updateTodo, deleteTodo } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchTodos = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching todos:', error)
      } else {
        setTodos(data)
      }
      setLoading(false)
    }

    fetchTodos()
  }, [user, setTodos])

  const createTodo = async (todoData: Insert<'todos'>) => {
    if (!user) throw new Error('User not authenticated')
    
    const supabase = createClient()
    const { data, error } = await supabase
      .from('todos')
      .insert({
        ...todoData,
        user_id: user.id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    addTodo(data as Todo)
    return data
  }

  const completeTodo = async (id: string) => {
    const supabase = createClient()
    const todo = todos.find((t) => t.id === id)
    if (!todo) return

    const { data: updatedTodo, error } = await supabase
      .from('todos')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    updateTodo(updatedTodo as Todo)

    if (todo.goal_id) {
      const durationMinutes = Math.round(
        (new Date(todo.end_time).getTime() - new Date(todo.start_time).getTime()) / 60000
      )

      await supabase.from('goal_logs').insert({
        goal_id: todo.goal_id,
        minutes: durationMinutes,
        source: 'todo',
        todo_id: id,
      })

      await supabase.rpc('update_goal_minutes', { goal_id: todo.goal_id })
    }

    return updatedTodo
  }

  const updateTodoStatus = async (id: string, status: Todo['status']) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('todos')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    updateTodo(data as Todo)
    return data
  }

  const softDeleteTodo = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('todos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    deleteTodo(id)
  }

  const editTodo = async (id: string, updates: Update<'todos'>) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('todos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    updateTodo(data as Todo)
    return data
  }

  const pendingTodos = todos.filter((t) => t.status === 'pending')
  const completedTodos = todos.filter((t) => t.status === 'completed')

  return {
    todos,
    pendingTodos,
    completedTodos,
    loading,
    createTodo,
    completeTodo,
    updateTodoStatus,
    softDeleteTodo,
    editTodo,
  }
}