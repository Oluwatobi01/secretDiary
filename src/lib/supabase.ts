import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

export type Database = {
  public: {
    Tables: {
      journals: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          color?: string
          icon?: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          color?: string
          icon?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          color?: string
          icon?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          journal_id: string
          user_id: string
          title: string
          content: string
          summary?: string
          mood?: string
          emotions?: string[]
          tags?: string[]
          is_favorite: boolean
          location?: string
          latitude?: number
          longitude?: number
          weather?: string
          template_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          journal_id: string
          user_id: string
          title: string
          content: string
          summary?: string
          mood?: string
          emotions?: string[]
          tags?: string[]
          is_favorite?: boolean
          location?: string
          latitude?: number
          longitude?: number
          weather?: string
          template_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          journal_id?: string
          user_id?: string
          title?: string
          content?: string
          summary?: string
          mood?: string
          emotions?: string[]
          tags?: string[]
          is_favorite?: boolean
          location?: string
          latitude?: number
          longitude?: number
          weather?: string
          template_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          user_id: string
          name: string
          content: string
          is_public: boolean
          category?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          content: string
          is_public?: boolean
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          content?: string
          is_public?: boolean
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          entry_id: string
          user_id: string
          type: 'image' | 'video' | 'audio'
          url: string
          caption?: string
          ocr_text?: string
          metadata?: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          user_id: string
          type: 'image' | 'video' | 'audio'
          url: string
          caption?: string
          ocr_text?: string
          metadata?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          user_id?: string
          type?: 'image' | 'video' | 'audio'
          url?: string
          caption?: string
          ocr_text?: string
          metadata?: Record<string, any>
          created_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          user_id: string
          type: 'weekly' | 'monthly' | 'yearly'
          content: Record<string, any>
          period_start: string
          period_end: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'weekly' | 'monthly' | 'yearly'
          content: Record<string, any>
          period_start: string
          period_end: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'weekly' | 'monthly' | 'yearly'
          content?: Record<string, any>
          period_start?: string
          period_end?: string
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description?: string
          target_date?: string
          status: 'active' | 'completed' | 'paused'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          target_date?: string
          status?: 'active' | 'completed' | 'paused'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          target_date?: string
          status?: 'active' | 'completed' | 'paused'
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'free' | 'premium'
          stripe_customer_id?: string
          stripe_subscription_id?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: 'free' | 'premium'
          stripe_customer_id?: string
          stripe_subscription_id?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'free' | 'premium'
          stripe_customer_id?: string
          stripe_subscription_id?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}