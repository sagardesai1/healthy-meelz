"use client";

import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface TimePreferencesStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

const timeOptions = [
  {
    id: "15-min",
    label: "15 minutes or less",
    description: "Quick and simple meals",
    icon: "⚡",
    color: "from-green-400 to-green-500",
  },
  {
    id: "15-30-min",
    label: "15-30 minutes",
    description: "Balanced speed and flavor",
    icon: "⏱️",
    color: "from-blue-400 to-blue-500",
  },
  {
    id: "30-60-min",
    label: "30-60 minutes",
    description: "More complex, satisfying dishes",
    icon: "🍳",
    color: "from-purple-400 to-purple-500",
  },
  {
    id: "1-2-hours",
    label: "1-2 hours",
    description: "Weekend cooking projects",
    icon: "🌅",
    color: "from-orange-400 to-orange-500",
  },
  {
    id: "2-plus-hours",
    label: "2+ hours",
    description: "Special occasion cooking",
    icon: "🎉",
    color: "from-red-400 to-red-500",
  },
  {
    id: "varies",
    label: "It varies",
    description: "I like to mix it up",
    icon: "🌈",
    color: "from-indigo-400 to-indigo-500",
  },
];

export default function TimePreferencesStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: TimePreferencesStepProps) {
  const handleTimeSelect = (timeId: string) => {
    updateFormData({ mealPrepTime: timeId });
  };

  const canProceed = formData.mealPrepTime !== "";

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sage-400 to-coral-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Your Time & Energy
          </h2>
          <p className="text-lg text-sage-700">
            How much time feels realistic for meal prep in your week?
          </p>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {timeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleTimeSelect(option.id)}
              className={`
                p-6 rounded-xl border-2 text-left transition-all duration-200 hover:transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sage-300
                ${
                  formData.mealPrepTime === option.id
                    ? "border-sage-500 bg-sage-100 text-sage-800 shadow-lg"
                    : "border-sage-200 bg-white text-sage-700 hover:border-sage-300 hover:bg-sage-50"
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{option.label}</h3>
                  <p
                    className={`text-sm ${
                      formData.mealPrepTime === option.id
                        ? "text-sage-700"
                        : "text-sage-600"
                    }`}
                  >
                    {option.description}
                  </p>
                </div>
                {formData.mealPrepTime === option.id && (
                  <div className="text-sage-600">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Helpful Information */}
        <div className="bg-sage-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-sage-800 mb-2 text-center">
            💡 Why This Matters
          </h3>
          <p className="text-sage-700 text-center">
            Understanding your time constraints helps us suggest meals that fit
            your lifestyle. Whether you have 15 minutes or 2 hours, we'll find
            recipes that work for you.
          </p>
        </div>

        {/* Encouraging Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            "Your time is precious. We want to help you make the most of every
            moment in the kitchen."
          </p>
        </div>

        {/* Additional Tips */}
        <div className="bg-white rounded-xl p-6 border border-sage-200 mb-8">
          <h3 className="font-semibold text-sage-800 mb-3 text-center">
            🌟 Time-Saving Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-sage-700">
            <div className="flex items-start space-x-2">
              <span className="text-sage-500">•</span>
              <span>Batch cook on weekends for weekday ease</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-sage-500">•</span>
              <span>Keep simple ingredients on hand</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-sage-500">•</span>
              <span>Use one-pot meals to minimize cleanup</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-sage-500">•</span>
              <span>Prep ingredients ahead when possible</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={onPrev}
            className="px-6 py-3 text-sage-600 hover:text-sage-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sage-300 rounded-lg"
          >
            ← Back
          </button>

          <button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className="bg-gradient-to-r from-sage-500 to-coral-500 hover:from-sage-600 hover:to-coral-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sage-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Continuing..." : "Continue"}
          </button>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-6">
          <button
            onClick={onNext}
            className="text-sage-500 hover:text-sage-700 text-sm font-medium transition-colors focus:outline-none"
          >
            Skip for now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
