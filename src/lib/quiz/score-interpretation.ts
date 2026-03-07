export interface ScoreInterpretation {
  range: string
  title: string
  description: string
  color: string
}

export function getScoreInterpretation(score: number): ScoreInterpretation {
  if (score >= 80) {
    return {
      range: '80-100',
      title: 'Authority Leader',
      description:
        'You have strong search presence. Focus on scaling your content and building topical authority.',
      color: 'accent3', // Green
    }
  } else if (score >= 60) {
    return {
      range: '60-79',
      title: 'Emerging Authority',
      description:
        'You have solid foundation. Optimize for AI visibility and build internal linking structure.',
      color: 'accent', // Yellow
    }
  } else if (score >= 40) {
    return {
      range: '40-59',
      title: 'Building Visibility',
      description:
        'You have presence but low visibility. Start with SEO-optimized pages from your best content.',
      color: 'accent', // Yellow
    }
  } else {
    return {
      range: '0-39',
      title: 'Authority Gap',
      description:
        'You lack search presence. This is your biggest growth opportunity. Start building now.',
      color: 'accent2', // Red
    }
  }
}
