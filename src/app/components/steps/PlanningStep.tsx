"use client";

import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface PlanningStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

const planningDays = [
  { value: "sunday", label: "Sunday", icon: "🌅" },
  { value: "monday", label: "Monday", icon: "🌱" },
  { value: "tuesday", label: "Tuesday", icon: "🌿" },
  { value: "wednesday", label: "Wednesday", icon: "🌸" },
  { value: "thursday", label: "Thursday", icon: "🌺" },
  { value: "friday", label: "Friday", icon: "🌻" },
  { value: "saturday", label: "Saturday", icon: "🌙" },
];

export default function PlanningStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: PlanningStepProps) {
  const handleDaySelect = (day: string) => {
    updateFormData({ planningDay: day });
  };

  const canProceed = formData.planningDay !== "";

  return (
    <div className="max-w-2xl mx-auto">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Planning Your Nourishment
          </h2>
          <p className="text-lg text-sage-700">
            When do you typically like to plan and shop for meals?
          </p>
        </div>

        {/* Day Selection */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {planningDays.map((day) => (
              <button
                key={day.value}
                onClick={() => handleDaySelect(day.value)}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200 text-center hover:transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sage-300
                  ${
                    formData.planningDay === day.value
                      ? "border-coral-500 bg-coral-50 text-coral-800 shadow-lg"
                      : "border-sage-200 bg-white text-sage-700 hover:border-sage-300 hover:bg-sage-50"
                  }
                `}
              >
                <div className="text-2xl mb-2">{day.icon}</div>
                <div className="text-sm font-medium">{day.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Helpful Tip */}
        <div className="bg-sage-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-sage-800 mb-2 text-center">
            💡 Helpful Tip
          </h3>
          <p className="text-sage-700 text-center">
            Choosing a consistent day helps create a rhythm that supports your
            nourishment journey. But remember, flexibility is always welcome!
          </p>
        </div>

        {/* Encouraging Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            "Planning is an act of self-care. You're creating space for
            nourishment in your life."
          </p>
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
