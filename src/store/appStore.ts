import { create } from 'zustand'
import { Todo, Goal, Note, MemorialEvent } from '@/types'

interface AppState {
  todos: Todo[]
  goals: Goal[]
  notes: Note[]
  memorialEvents: MemorialEvent[]
  
  setTodos: (todos: Todo[]) => void
  setGoals: (goals: Goal[]) => void
  setNotes: (notes: Note[]) => void
  setMemorialEvents: (events: MemorialEvent[]) => void
  
  addTodo: (todo: Todo) => void
  updateTodo: (todo: Todo) => void
  deleteTodo: (id: string) => void
  
  addGoal: (goal: Goal) => void
  updateGoal: (goal: Goal) => void
  deleteGoal: (id: string) => void
  
  addNote: (note: Note) => void
  updateNote: (note: Note) => void
  deleteNote: (id: string) => void
  
  addMemorialEvent: (event: MemorialEvent) => void
  updateMemorialEvent: (event: MemorialEvent) => void
  deleteMemorialEvent: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  todos: [],
  goals: [],
  notes: [],
  memorialEvents: [],
  
  setTodos: (todos) => set({ todos }),
  setGoals: (goals) => set({ goals }),
  setNotes: (notes) => set({ notes }),
  setMemorialEvents: (events) => set({ memorialEvents: events }),
  
  addTodo: (todo) => set((state) => ({ todos: [todo, ...state.todos] })),
  updateTodo: (updatedTodo) => set((state) => ({
    todos: state.todos.map((t) => t.id === updatedTodo.id ? updatedTodo : t)
  })),
  deleteTodo: (id) => set((state) => ({
    todos: state.todos.filter((t) => t.id !== id)
  })),
  
  addGoal: (goal) => set((state) => ({ goals: [goal, ...state.goals] })),
  updateGoal: (updatedGoal) => set((state) => ({
    goals: state.goals.map((g) => g.id === updatedGoal.id ? updatedGoal : g)
  })),
  deleteGoal: (id) => set((state) => ({
    goals: state.goals.filter((g) => g.id !== id)
  })),
  
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (updatedNote) => set((state) => ({
    notes: state.notes.map((n) => n.id === updatedNote.id ? updatedNote : n)
  })),
  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((n) => n.id !== id)
  })),
  
  addMemorialEvent: (event) => set((state) => ({ memorialEvents: [event, ...state.memorialEvents] })),
  updateMemorialEvent: (updatedEvent) => set((state) => ({
    memorialEvents: state.memorialEvents.map((e) => e.id === updatedEvent.id ? updatedEvent : e)
  })),
  deleteMemorialEvent: (id) => set((state) => ({
    memorialEvents: state.memorialEvents.filter((e) => e.id !== id)
  })),
}))