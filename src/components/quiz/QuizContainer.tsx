'use client'

import { useState } from 'react'
import { useQuizState } from '@/hooks/useQuizState'
import { QuizProgress } from './QuizProgress'
import { QuizStep } from './QuizStep'
import { QuizResult } from './QuizResult'
import { CardOption } from './ui/CardOption'
import { ChipOption } from './ui/ChipOption'
import { quizSteps } from '@/lib/quiz/quiz-data'

export function QuizContainer() {
  const { state, updateState, nextStep, prevStep } = useQuizState()
  const [error, setError] = useState<string | null>(null)

  const currentStepData = quizSteps[state.currentStep]
  const totalSteps = quizSteps.length

  const handleNext = () => {
    // Validation
    if (currentStepData.required) {
      if (state.currentStep === 1 && !state.name) {
        setError('Please enter your name')
        return
      }
      if (state.currentStep === 2 && !state.primaryPlatform) {
        setError('Please select your primary platform')
        return
      }
      if (state.currentStep === 4 && !state.niche) {
        setError('Please describe your niche')
        return
      }
    }

    setError(null)
    nextStep()
  }

  const isCompleted = state.currentStep >= totalSteps

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {!isCompleted && (
          <QuizProgress currentStep={state.currentStep} totalSteps={totalSteps} />
        )}

        {isCompleted ? (
          <QuizResult state={state} />
        ) : (
          <>
            {/* Step 0: Intro */}
            <QuizStep step={0} isActive={state.currentStep === 0}>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">
                  {currentStepData.title}
                </h1>
                <p className="text-xl text-txt-mid mb-6">
                  {currentStepData.subtitle}
                </p>
                <p className="text-txt-mid">{currentStepData.question}</p>
              </div>
              <button
                onClick={nextStep}
                className="w-full bg-accent text-bg font-medium py-4 rounded-lg hover:bg-accent/90 transition-smooth"
              >
                Start Audit
              </button>
            </QuizStep>

            {/* Step 1: Identity */}
            <QuizStep step={1} isActive={state.currentStep === 1}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-txt-mid">{currentStepData.question}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={state.name || ''}
                    onChange={(e) => updateState({ name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-smooth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Handle (optional)
                  </label>
                  <input
                    type="text"
                    value={state.handle || ''}
                    onChange={(e) => updateState({ handle: e.target.value })}
                    placeholder="@yourhandle"
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-smooth"
                  />
                </div>
              </div>
            </QuizStep>

            {/* Step 2: Primary Platform */}
            <QuizStep step={2} isActive={state.currentStep === 2}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-txt-mid">{currentStepData.question}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentStepData.options?.map((option) => (
                  <CardOption
                    key={option.id}
                    id={option.id}
                    label={option.label}
                    description={option.description}
                    selected={state.primaryPlatform === option.id}
                    onClick={(id) => updateState({ primaryPlatform: id as any })}
                  />
                ))}
              </div>
            </QuizStep>

            {/* Step 3: Secondary Channels */}
            <QuizStep step={3} isActive={state.currentStep === 3}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-txt-mid">{currentStepData.question}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {currentStepData.options
                  ?.filter((opt) => opt.id !== state.primaryPlatform)
                  .map((option) => (
                    <ChipOption
                      key={option.id}
                      id={option.id}
                      label={option.label}
                      selected={state.secondaryChannels.includes(option.id)}
                      onClick={(id) => {
                        const channels = state.secondaryChannels.includes(id)
                          ? state.secondaryChannels.filter((c) => c !== id)
                          : [...state.secondaryChannels, id]
                        updateState({ secondaryChannels: channels })
                      }}
                    />
                  ))}
              </div>
            </QuizStep>

            {/* Step 4: Niche */}
            <QuizStep step={4} isActive={state.currentStep === 4}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-txt-mid">{currentStepData.question}</p>
              </div>

              <textarea
                value={state.niche || ''}
                onChange={(e) => updateState({ niche: e.target.value })}
                placeholder={currentStepData.placeholder}
                rows={4}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-smooth resize-none"
              />
            </QuizStep>

            {/* Error message */}
            {error && (
              <div className="mt-4 bg-accent2/10 border border-accent2/20 rounded-lg p-3">
                <p className="text-accent2 text-sm">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {state.currentStep > 0 && (
                <button
                  onClick={prevStep}
                  className="px-6 py-3 border border-border hover:border-border-md rounded-lg transition-smooth"
                >
                  Back
                </button>
              )}

              {state.currentStep > 0 && (
                <button
                  onClick={handleNext}
                  className="ml-auto bg-accent text-bg font-medium px-8 py-3 rounded-lg hover:bg-accent/90 transition-smooth"
                >
                  {state.currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
