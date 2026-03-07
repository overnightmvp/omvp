'use client'

interface QuizProgressProps {
  currentStep: number
  totalSteps: number
}

export function QuizProgress({ currentStep, totalSteps }: QuizProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-txt-mid">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-txt-mid">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-500 ease-smooth"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
