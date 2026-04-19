'use client'

export default function StepForm({ steps, currentStep, children, onNext, onBack, onSubmit, loading, submitLabel = 'Submit' }) {
  const total = steps.length
  const isLast = currentStep === total - 1

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors ${
              i < currentStep
                ? 'bg-paddy-500 text-white'
                : i === currentStep
                ? 'bg-turmeric-500 text-white'
                : 'bg-white/10 text-white/40'
            }`}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block transition-colors ${
              i === currentStep ? 'text-white' : i < currentStep ? 'text-paddy-400' : 'text-white/35'
            }`}>
              {step}
            </span>
            {i < total - 1 && (
              <div className={`flex-1 h-px mx-2 transition-colors ${i < currentStep ? 'bg-paddy-500' : 'bg-white/15'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="mb-8">{children}</div>

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-white/10 hover:bg-white/15 text-white font-medium py-3 rounded-xl transition-colors"
          >
            ← Back
          </button>
        )}
        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Submitting…' : submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="flex-1 bg-paddy-600 hover:bg-paddy-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
