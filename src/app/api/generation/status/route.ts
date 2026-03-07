import { createClient } from '@/lib/supabase/server'
import { getUserQueueItems, getEstimatedTime } from '@/lib/generation-queue'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all queue items for user
    const queueItems = await getUserQueueItems(user.id)

    // Get pending items count (for queue position calculation)
    const { count: pendingCount } = await supabase
      .from('generation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Find user's pending item
    const userPendingItem = queueItems.find(
      (item) => item.status === 'pending'
    )

    let queuePosition = 0
    let estimatedTime = ''

    if (userPendingItem) {
      // Calculate queue position (count items with higher priority queued before this one)
      const { count: beforeCount } = await supabase
        .from('generation_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .or(
          `priority.gt.${userPendingItem.priority},and(priority.eq.${userPendingItem.priority},queued_at.lt.${userPendingItem.queued_at})`
        )

      queuePosition = (beforeCount || 0) + 1
      estimatedTime = getEstimatedTime(queuePosition)
    }

    return NextResponse.json({
      queueItems,
      currentItem: queueItems[0] || null,
      queuePosition,
      estimatedTime,
      totalPending: pendingCount || 0,
    })
  } catch (error: any) {
    console.error('Error fetching queue status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch queue status' },
      { status: 500 }
    )
  }
}