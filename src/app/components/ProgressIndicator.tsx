"use client";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (stepIndex: number) => void;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps,
  onStepClick,
}: ProgressIndicatorProps) {
  const stepNames = [
    "Welcome",
    "Contact",
    "Planning",
    "Goals",
    "Dietary",
    "Household",
    "Food",
    "Time",
    "Joy",
    "Complete",
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-sage-700">
          Step {currentStep + 1} of {totalSteps}
        </h2>
        <span className="text-sm text-sage-600">
          {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-sage-200 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-sage-500 to-coral-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="hidden md:flex items-center justify-between">
        {stepNames.map((name, index) => (
          <button
            key={index}
            onClick={() => onStepClick(index)}
            className={`flex flex-col items-center transition-all duration-200 ${
              index <= currentStep
                ? "text-sage-700"
                : "text-sage-400 hover:text-sage-600"
            }`}
            disabled={index > currentStep + 1}
          >
            <div
              className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2
              ${
                index < currentStep
                  ? "bg-sage-500 text-white"
                  : index === currentStep
                  ? "bg-coral-500 text-white ring-4 ring-coral-200"
                  : "bg-sage-200 text-sage-600"
              }
            `}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className="text-xs font-medium text-center max-w-16">
              {name}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden text-center">
        <span className="text-sage-700 font-medium">
          {stepNames[currentStep]}
        </span>
      </div>
    </div>
  );
}
