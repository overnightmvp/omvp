import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']

export type Profile = Tables['profiles']['Row']
export type ProfileInsert = Tables['profiles']['Insert']
export type ProfileUpdate = Tables['profiles']['Update']

export type QuizResponse = Tables['quiz_responses']['Row']
export type QuizResponseInsert = Tables['quiz_responses']['Insert']
export type QuizResponseUpdate = Tables['quiz_responses']['Update']

export type YouTubeConnection = Tables['youtube_connections']['Row']
export type YouTubeConnectionInsert = Tables['youtube_connections']['Insert']
export type YouTubeConnectionUpdate = Tables['youtube_connections']['Update']

export type OAuthState = Tables['oauth_states']['Row']
export type OAuthStateInsert = Tables['oauth_states']['Insert']

export type GenerationQueueItem = Tables['generation_queue']['Row']
export type GenerationQueueInsert = Tables['generation_queue']['Insert']
export type GenerationQueueUpdate = Tables['generation_queue']['Update']

// Helper functions for common queries

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export async function upsertProfile(
  profile: ProfileInsert
): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single()

  if (error) {
    console.error('Error upserting profile:', error)
    return null
  }
  return data
}

export async function getQuizResponse(
  userId: string
): Promise<QuizResponse | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_responses')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}

export async function upsertQuizResponse(
  quiz: QuizResponseInsert
): Promise<QuizResponse | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('quiz_responses')
    .upsert(quiz)
    .select()
    .single()

  if (error) {
    console.error('Error upserting quiz response:', error)
    return null
  }
  return data
}

export async function getYouTubeConnection(
  userId: string
): Promise<YouTubeConnection | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('youtube_connections')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}

export async function createYouTubeConnection(
  connection: YouTubeConnectionInsert
): Promise<YouTubeConnection | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('youtube_connections')
    .insert(connection)
    .select()
    .single()

  if (error) {
    console.error('Error creating YouTube connection:', error)
    return null
  }
  return data
}

export async function updateYouTubeConnection(
  id: string,
  update: YouTubeConnectionUpdate
): Promise<YouTubeConnection | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('youtube_connections')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating YouTube connection:', error)
    return null
  }
  return data
}

export async function getUserGenerationQueue(
  userId: string
): Promise<GenerationQueueItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('generation_queue')
    .select('*')
    .eq('user_id', userId)
    .order('queued_at', { ascending: false })

  if (error) return []
  return data
}

export async function createQueueItem(
  item: GenerationQueueInsert
): Promise<GenerationQueueItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('generation_queue')
    .insert(item)
    .select()
    .single()

  if (error) {
    console.error('Error creating queue item:', error)
    return null
  }
  return data
}

export async function createOAuthState(
  userId: string,
  state: string,
  expiresAt: Date
): Promise<OAuthState | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('oauth_states')
    .insert({
      user_id: userId,
      state,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating OAuth state:', error)
    return null
  }
  return data
}

export async function getOAuthState(state: string): Promise<OAuthState | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('oauth_states')
    .select('*')
    .eq('state', state)
    .single()

  if (error) return null
  return data
}

export async function deleteOAuthState(state: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('oauth_states')
    .delete()
    .eq('state', state)

  return !error
}
