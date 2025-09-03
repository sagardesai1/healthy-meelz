"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface GoalsStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

const goalOptions = [
  {
    id: "consistent-habits",
    label: "Build consistent eating habits",
    description: "Create a rhythm that supports your wellbeing",
    icon: "🌱",
    color: "from-sage-400 to-sage-500",
  },
  {
    id: "discover-foods",
    label: "Discover new nourishing foods",
    description: "Expand your palate with gentle exploration",
    icon: "🔍",
    color: "from-coral-400 to-coral-500",
  },
  {
    id: "simplify-planning",
    label: "Simplify meal planning",
    description: "Make nourishment feel effortless",
    icon: "✨",
    color: "from-blue-400 to-blue-500",
  },
  {
    id: "cook-more",
    label: "Cook more meals at home",
    description: "Find joy in creating your own nourishment",
    icon: "👩‍🍳",
    color: "from-purple-400 to-purple-500",
  },
  {
    id: "kitchen-confidence",
    label: "Feel more confident in the kitchen",
    description: "Build skills that empower you",
    icon: "💪",
    color: "from-green-400 to-green-500",
  },
  {
    id: "energy-support",
    label: "Support my energy levels",
    description: "Nourish your body for vitality",
    icon: "⚡",
    color: "from-yellow-400 to-yellow-500",
  },
  {
    id: "peaceful-meals",
    label: "Create peaceful mealtimes",
    description: "Transform eating into a mindful experience",
    icon: "🧘",
    color: "from-indigo-400 to-indigo-500",
  },
];

export default function GoalsStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: GoalsStepProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);

  const handleGoalToggle = (goalId: string) => {
    const currentGoals = formData.goals;
    if (currentGoals.includes(goalId)) {
      updateFormData({ goals: currentGoals.filter((id) => id !== goalId) });
    } else {
      updateFormData({ goals: [...currentGoals, goalId] });
    }
  };

  const handleOtherGoalChange = (value: string) => {
    updateFormData({ otherGoal: value });
  };

  const canProceed =
    formData.goals.length > 0 || formData.otherGoal.trim() !== "";

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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Your Nourishment Goals
          </h2>
          <p className="text-lg text-sage-700">
            What would feel most supportive for your nourishment journey?
          </p>
          <p className="text-sage-600 mt-2">
            Select all that resonate with you
          </p>
        </div>

        {/* Goals Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {goalOptions.map((goal) => (
            <button
              key={goal.id}
              onClick={() => handleGoalToggle(goal.id)}
              className={`
                p-6 rounded-xl border-2 text-left transition-all duration-200 hover:transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sage-300
                ${
                  formData.goals.includes(goal.id)
                    ? "border-sage-500 bg-sage-100 text-sage-800 shadow-lg"
                    : "border-sage-200 bg-white text-sage-700 hover:border-sage-300 hover:bg-sage-50"
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{goal.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{goal.label}</h3>
                  <p
                    className={`text-sm ${
                      formData.goals.includes(goal.id)
                        ? "text-sage-700"
                        : "text-sage-600"
                    }`}
                  >
                    {goal.description}
                  </p>
                </div>
                {formData.goals.includes(goal.id) && (
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

        {/* Other Goal Input */}
        <div className="mb-8">
          <button
            onClick={() => setShowOtherInput(!showOtherInput)}
            className="w-full p-4 border-2 border-dashed border-sage-300 rounded-xl text-sage-600 hover:border-sage-400 hover:text-sage-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">✨</span>
              <span className="font-medium">Add another goal</span>
            </div>
          </button>

          {showOtherInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <textarea
                value={formData.otherGoal}
                onChange={(e) => handleOtherGoalChange(e.target.value)}
                placeholder="What else would feel supportive for your nourishment journey?"
                className="w-full p-4 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors resize-none text-sage-900"
                rows={3}
              />
            </motion.div>
          )}
        </div>

        {/* Encouraging Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            "Your goals are unique to you, and that's exactly right. Every step
            toward nourishment matters."
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
