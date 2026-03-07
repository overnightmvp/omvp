import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type GenerationQueueRow = Database['public']['Tables']['generation_queue']['Row']
export type QueueStatus = 'pending' | 'processing' | 'published' | 'failed'

export async function queuePageGeneration(
  userId: string,
  videoId: string,
  videoTitle: string,
  videoUrl: string,
  videoDescription?: string,
  priority: number = 0
): Promise<GenerationQueueRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('generation_queue')
    .insert({
      user_id: userId,
      video_id: videoId,
      video_title: videoTitle,
      video_url: videoUrl,
      video_description: videoDescription,
      status: 'pending',
      priority,
      queued_at: new Date().toISOString(),
    } as any)
    .select()
    .single()

  if (error) {
    console.error('Error queuing page generation:', error)
    return null
  }

  return data as GenerationQueueRow | null
}

export async function getQueueItem(
  itemId: string
): Promise<GenerationQueueRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('generation_queue')
    .select('*')
    .eq('id', itemId)
    .single()

  if (error) return null
  return data as GenerationQueueRow | null
}

export async function getUserQueueItems(
  userId: string
): Promise<GenerationQueueRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('generation_queue')
    .select('*')
    .eq('user_id', userId)
    .order('queued_at', { ascending: false })

  if (error) return []
  return (data || []) as GenerationQueueRow[]
}

export async function updateQueueStatus(
  itemId: string,
  status: QueueStatus,
  errorMessage?: string
): Promise<boolean> {
  const supabase = await createClient()

  try {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'processing') {
      updates.started_at = new Date().toISOString()
    } else if (status === 'published' || status === 'failed') {
      updates.completed_at = new Date().toISOString()
    }

    if (errorMessage) {
      updates.error_message = errorMessage
    }

    // Use type assertion to bypass Supabase type issues
    const { error } = await (supabase as any)
      .from('generation_queue')
      .update(updates)
      .eq('id', itemId)

    return !error
  } catch (error) {
    console.error('Error updating queue status:', error)
    return false
  }
}

export function getEstimatedTime(queuePosition: number): string {
  // Estimate 15 minutes per item
  const minutes = queuePosition * 15

  if (minutes < 60) {
    return `~${minutes} minutes`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `~${hours} hour${hours > 1 ? 's' : ''}`
  }

  return `~${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} min`
}