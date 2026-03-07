import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GenerationQueueStatus } from '@/components/dashboard/GenerationQueueStatus'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generating Your Page | Authority Platform',
  description: 'Your SEO page is being generated',
}

export default async function GeneratingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <GenerationQueueStatus />
      </div>
    </div>
  )
}