import { QuizContainer } from '@/components/quiz/QuizContainer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authority Gap Audit | Authority Platform',
  description: 'Discover where you stand in Google and AI search',
}

export default function QuizPage() {
  return <QuizContainer />
}
