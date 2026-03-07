export interface QuizOption {
  id: string
  label: string
  description?: string
}

export interface QuizStepData {
  id: number
  title: string
  subtitle?: string
  question: string
  type: 'text' | 'select' | 'multi-select' | 'scale' | 'textarea' | 'anti-vision'
  options?: QuizOption[]
  placeholder?: string
  required: boolean
}

export const quizSteps: QuizStepData[] = [
  // Step 0: Intro
  {
    id: 0,
    title: 'Authority Gap Audit',
    subtitle: 'Discover where you stand in Google and AI search',
    question: 'Take 3 minutes to see your current authority score',
    type: 'text',
    required: false,
  },

  // Step 1: Identity
  {
    id: 1,
    title: 'Who are you?',
    question: 'What name and handle should we use?',
    type: 'text',
    placeholder: 'Your name',
    required: true,
  },

  // Step 2: Primary Platform
  {
    id: 2,
    title: 'Primary Platform',
    question: 'Where do you create content?',
    type: 'select',
    options: [
      { id: 'youtube', label: 'YouTube', description: 'Video content' },
      { id: 'instagram', label: 'Instagram', description: 'Photos & Reels' },
      { id: 'tiktok', label: 'TikTok', description: 'Short-form video' },
      { id: 'linkedin', label: 'LinkedIn', description: 'Professional' },
      { id: 'twitter', label: 'Twitter/X', description: 'Microblogging' },
      { id: 'podcast', label: 'Podcast', description: 'Audio content' },
    ],
    required: true,
  },

  // Step 3: Secondary Channels
  {
    id: 3,
    title: 'Other Platforms',
    question: 'Do you have presence on other channels? (Optional)',
    type: 'multi-select',
    options: [
      { id: 'youtube', label: 'YouTube' },
      { id: 'instagram', label: 'Instagram' },
      { id: 'tiktok', label: 'TikTok' },
      { id: 'linkedin', label: 'LinkedIn' },
      { id: 'twitter', label: 'Twitter/X' },
      { id: 'podcast', label: 'Podcast' },
      { id: 'newsletter', label: 'Newsletter' },
      { id: 'blog', label: 'Blog' },
    ],
    required: false,
  },

  // Step 4: Niche
  {
    id: 4,
    title: 'Your Niche',
    question: 'Describe your niche in one sentence',
    type: 'textarea',
    placeholder: 'E.g., I help fitness coaches grow their online business...',
    required: true,
  },

  // Additional steps (5-9) will be added in Part 2
]
