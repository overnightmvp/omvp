import type { QuizState } from '@/hooks/useQuizState'

export function calculateAuthorityScore(state: QuizState): number {
  let score = 20 // Base score

  // Google presence (max +20)
  if (state.googlePresence === 'page1') score += 20
  else if (state.googlePresence === 'exists') score += 10
  else if (state.googlePresence === 'dontknow') score += 2

  // AI visibility (max +18)
  if (state.aiPresence === 'mentioned') score += 18
  else if (state.aiPresence === 'others') score += 6
  else if (state.aiPresence === 'untested') score += 2

  // Website (max +18)
  if (state.websiteStatus === 'yes_good') score += 18
  else if (state.websiteStatus === 'yes_basic') score += 8

  // Clear niche (max +12)
  if (state.niche && state.niche.length > 10) score += 8
  if (state.nicheCategory) score += 4

  // Offers clarity (max +8)
  if (state.offers.length > 0 && !state.offers.includes('undecided')) score += 8
  if (state.offers.includes('undecided')) score -= 4

  // Cross-platform presence (max +4)
  if (state.secondaryChannels.length >= 2) score += 4

  // Anti-vision clarity (max +4)
  if (state.antiVision.length >= 2) score += 4

  // Ensure score is between 5 and 100
  return Math.min(100, Math.max(5, score))
}
