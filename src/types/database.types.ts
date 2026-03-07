export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          handle: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          handle?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          handle?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_responses: {
        Row: {
          id: string
          user_id: string
          name: string
          handle: string | null
          primary_platform: string
          secondary_channels: string[]
          niche: string
          niche_category: string | null
          offers: string[]
          google_presence: string | null
          ai_presence: string | null
          website_status: string | null
          brand_tones: string[]
          anti_vision: string[]
          anti_custom: string | null
          blocker: string | null
          timeline: string | null
          context: string | null
          authority_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          handle?: string | null
          primary_platform: string
          secondary_channels?: string[]
          niche: string
          niche_category?: string | null
          offers?: string[]
          google_presence?: string | null
          ai_presence?: string | null
          website_status?: string | null
          brand_tones?: string[]
          anti_vision?: string[]
          anti_custom?: string | null
          blocker?: string | null
          timeline?: string | null
          context?: string | null
          authority_score: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          handle?: string | null
          primary_platform?: string
          secondary_channels?: string[]
          niche?: string
          niche_category?: string | null
          offers?: string[]
          google_presence?: string | null
          ai_presence?: string | null
          website_status?: string | null
          brand_tones?: string[]
          anti_vision?: string[]
          anti_custom?: string | null
          blocker?: string | null
          timeline?: string | null
          context?: string | null
          authority_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      youtube_connections: {
        Row: {
          id: string
          user_id: string
          channel_id: string
          channel_name: string
          channel_url: string | null
          channel_subscriber_count: number | null
          access_token: string
          refresh_token: string
          token_expires_at: string
          connected_at: string
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          channel_id: string
          channel_name: string
          channel_url?: string | null
          channel_subscriber_count?: number | null
          access_token: string
          refresh_token: string
          token_expires_at: string
          connected_at?: string
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          channel_id?: string
          channel_name?: string
          channel_url?: string | null
          channel_subscriber_count?: number | null
          access_token?: string
          refresh_token?: string
          token_expires_at?: string
          connected_at?: string
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      oauth_states: {
        Row: {
          id: string
          user_id: string
          state: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          state: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          state?: string
          expires_at?: string
          created_at?: string
        }
      }
      generation_queue: {
        Row: {
          id: string
          user_id: string
          video_id: string
          video_title: string
          video_url: string
          video_description: string | null
          status: string
          priority: number
          error_message: string | null
          retry_count: number
          queued_at: string
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          video_id: string
          video_title: string
          video_url: string
          video_description?: string | null
          status?: string
          priority?: number
          error_message?: string | null
          retry_count?: number
          queued_at?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          video_title?: string
          video_url?: string
          video_description?: string | null
          status?: string
          priority?: number
          error_message?: string | null
          retry_count?: number
          queued_at?: string
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      cleanup_expired_oauth_states: {
        Args: {}
        Returns: void
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

// Helper instructions for generation:
// npx supabase gen types typescript --db-url "postgresql://postgres:PASSWORD@HOST:5432/postgres" --schema public > src/types/database.types.ts
