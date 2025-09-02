import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Types for Supabase Database
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          target_value: number
          current_value: number
          unit: string
          deadline: string | null
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          target_value: number
          current_value?: number
          unit: string
          deadline?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          target_value?: number
          current_value?: number
          unit?: string
          deadline?: string | null
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          goal_id: string
          title: string
          value: number
          is_completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          title: string
          value: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          title?: string
          value?: number
          is_completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          priority: string
          due_date: string | null
          is_completed: boolean
          completed_at: string | null
          is_recurring: boolean
          recurring_pattern: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          priority?: string
          due_date?: string | null
          is_completed?: boolean
          completed_at?: string | null
          is_recurring?: boolean
          recurring_pattern?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          priority?: string
          due_date?: string | null
          is_completed?: boolean
          completed_at?: string | null
          is_recurring?: boolean
          recurring_pattern?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: string
          target: number
          unit: string
          frequency: string
          color: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category: string
          target: number
          unit: string
          frequency: string
          color: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: string
          target?: number
          unit?: string
          frequency?: string
          color?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      habit_records: {
        Row: {
          id: string
          habit_id: string
          date: string
          value: number
          is_completed: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          date: string
          value: number
          is_completed?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          date?: string
          value?: number
          is_completed?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      sleep_records: {
        Row: {
          id: string
          user_id: string
          date: string
          bedtime: string | null
          wake_time: string | null
          hours_slept: number | null
          quality: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          bedtime?: string | null
          wake_time?: string | null
          hours_slept?: number | null
          quality?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          bedtime?: string | null
          wake_time?: string | null
          hours_slept?: number | null
          quality?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      exercise_records: {
        Row: {
          id: string
          user_id: string
          date: string
          type: string
          duration: number
          intensity: string
          calories: number | null
          notes: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          type: string
          duration: number
          intensity: string
          calories?: number | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          type?: string
          duration?: number
          intensity?: string
          calories?: number | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      nutrition_records: {
        Row: {
          id: string
          user_id: string
          date: string
          meal: string
          food: string
          calories: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          meal: string
          food: string
          calories: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          meal?: string
          food?: string
          calories?: number
          notes?: string | null
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          category: string
          description: string
          date: string
          is_recurring: boolean
          recurring_pattern: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          category: string
          description: string
          date: string
          is_recurring?: boolean
          recurring_pattern?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          category?: string
          description?: string
          date?: string
          is_recurring?: boolean
          recurring_pattern?: string | null
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          allocated: number
          spent: number
          month: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          allocated: number
          spent?: number
          month: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          allocated?: number
          spent?: number
          month?: number
          year?: number
          created_at?: string
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          current_amount: number
          deadline: string
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          current_amount?: number
          deadline: string
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          current_amount?: number
          deadline?: string
          is_completed?: boolean
          created_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          current_value: number
          purchase_value: number
          purchase_date: string
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          current_value: number
          purchase_value: number
          purchase_date: string
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          current_value?: number
          purchase_value?: number
          purchase_date?: string
          last_updated?: string
          created_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          title: string | null
          content: string
          mood: number
          tags: string[]
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          title?: string | null
          content: string
          mood: number
          tags?: string[]
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          title?: string | null
          content?: string
          mood?: number
          tags?: string[]
          image_url?: string | null
          created_at?: string
        }
      }
      books: {
        Row: {
          id: string
          user_id: string
          title: string
          author: string
          status: string
          current_page: number | null
          total_pages: number | null
          rating: number | null
          started_at: string | null
          completed_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          author: string
          status: string
          current_page?: number | null
          total_pages?: number | null
          rating?: number | null
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          author?: string
          status?: string
          current_page?: number | null
          total_pages?: number | null
          rating?: number | null
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          user_id: string
          title: string
          director: string | null
          year: number | null
          status: string
          rating: number | null
          watched_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          director?: string | null
          year?: number | null
          status: string
          rating?: number | null
          watched_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          director?: string | null
          year?: number | null
          status?: string
          rating?: number | null
          watched_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          date: string
          location: string | null
          tags: string[]
          is_special: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          date: string
          location?: string | null
          tags?: string[]
          is_special?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          date?: string
          location?: string | null
          tags?: string[]
          is_special?: boolean
          created_at?: string
        }
      }
      memory_images: {
        Row: {
          id: string
          memory_id: string
          image_url: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          memory_id: string
          image_url: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          memory_id?: string
          image_url?: string
          order_index?: number
          created_at?: string
        }
      }
      progress_photos: {
        Row: {
          id: string
          user_id: string
          image_url: string
          date: string
          weight: number | null
          body_fat_percentage: number | null
          muscle_mass: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          date: string
          weight?: number | null
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          date?: string
          weight?: number | null
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      secrets: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          website: string | null
          username: string | null
          password: string
          notes: string | null
          custom_fields: Record<string, any> | null
          last_accessed: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: string
          website?: string | null
          username?: string | null
          password: string
          notes?: string | null
          custom_fields?: Record<string, any> | null
          last_accessed?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          website?: string | null
          username?: string | null
          password?: string
          notes?: string | null
          custom_fields?: Record<string, any> | null
          last_accessed?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
