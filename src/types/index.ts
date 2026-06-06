export type TodoPriority = 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent'

export type TodoStatus = 'pending' | 'completed' | 'archived'

export type GoalStatus = 'active' | 'paused' | 'completed'

export type EventType = 'Birthday' | 'Anniversary' | 'Exam' | 'Travel' | 'Custom'

export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  priority: TodoPriority
  status: TodoStatus
  goal_id: string | null
  tags: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Goal {
  id: string
  user_id: string
  name: string
  description: string | null
  target_minutes: number
  current_minutes: number
  status: GoalStatus
  icon: string | null
  created_at: string
  updated_at: string
}

export interface GoalLog {
  id: string
  goal_id: string
  minutes: number
  source: 'manual' | 'todo'
  todo_id: string | null
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  note_date: string
  title: string | null
  content: string | null
  created_at: string
  updated_at: string
}

export interface NoteImage {
  id: string
  note_id: string
  image_url: string
}

export interface MemorialEvent {
  id: string
  user_id: string
  name: string
  event_date: string
  event_type: EventType
  is_lunar: boolean
  cover_image: string | null
  reminder_enabled: boolean
  created_at: string
}

export interface MemorialRecord {
  id: string
  event_id: string
  title: string
  description: string | null
  image_url: string | null
  record_date: string
  created_at: string
}

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}