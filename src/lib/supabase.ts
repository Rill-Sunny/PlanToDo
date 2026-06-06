import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()

export type Database = {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          priority: 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent'
          status: 'pending' | 'completed' | 'archived'
          goal_id: string | null
          tags: string[]
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          priority: 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent'
          status?: 'pending' | 'completed' | 'archived'
          goal_id?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          priority?: 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent'
          status?: 'pending' | 'completed' | 'archived'
          goal_id?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          target_minutes: number
          current_minutes: number
          status: 'active' | 'paused' | 'completed'
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          description?: string | null
          target_minutes: number
          current_minutes?: number
          status?: 'active' | 'paused' | 'completed'
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          target_minutes?: number
          current_minutes?: number
          status?: 'active' | 'paused' | 'completed'
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goal_logs: {
        Row: {
          id: string
          goal_id: string
          minutes: number
          source: 'manual' | 'todo'
          todo_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          minutes: number
          source: 'manual' | 'todo'
          todo_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          minutes?: number
          source?: 'manual' | 'todo'
          todo_id?: string | null
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          note_date: string
          title: string | null
          content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          note_date: string
          title?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          note_date?: string
          title?: string | null
          content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      note_images: {
        Row: {
          id: string
          note_id: string
          image_url: string
        }
        Insert: {
          id?: string
          note_id: string
          image_url: string
        }
        Update: {
          id?: string
          note_id?: string
          image_url?: string
        }
      }
      memorial_events: {
        Row: {
          id: string
          user_id: string
          name: string
          event_date: string
          event_type: 'Birthday' | 'Anniversary' | 'Exam' | 'Travel' | 'Custom'
          is_lunar: boolean
          cover_image: string | null
          reminder_enabled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          event_date: string
          event_type?: 'Birthday' | 'Anniversary' | 'Exam' | 'Travel' | 'Custom'
          is_lunar?: boolean
          cover_image?: string | null
          reminder_enabled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          event_date?: string
          event_type?: 'Birthday' | 'Anniversary' | 'Exam' | 'Travel' | 'Custom'
          is_lunar?: boolean
          cover_image?: string | null
          reminder_enabled?: boolean
          created_at?: string
        }
      }
      memorial_records: {
        Row: {
          id: string
          event_id: string
          title: string
          description: string | null
          image_url: string | null
          record_date: string
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          description?: string | null
          image_url?: string | null
          record_date: string
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          record_date?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      todo_status: ['pending', 'completed', 'archived']
      goal_status: ['active', 'paused', 'completed']
      priority_level: ['important_urgent', 'important_not_urgent', 'not_important_urgent', 'not_important_not_urgent']
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Update<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']