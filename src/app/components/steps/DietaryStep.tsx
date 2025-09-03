"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface DietaryStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

const commonRestrictions = [
  { id: "gluten-free", label: "Gluten-free", icon: "🌾" },
  { id: "dairy-free", label: "Dairy-free", icon: "🥛" },
  { id: "vegetarian", label: "Vegetarian", icon: "🥬" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "nut-allergies", label: "Nut allergies", icon: "🥜" },
  { id: "shellfish-allergy", label: "Shellfish allergy", icon: "🦐" },
  { id: "egg-free", label: "Egg-free", icon: "🥚" },
  { id: "soy-free", label: "Soy-free", icon: "🫘" },
];

export default function DietaryStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: DietaryStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  const handleRestrictionToggle = (restrictionId: string) => {
    const currentRestrictions = formData.dietaryRestrictions;
    if (currentRestrictions.includes(restrictionId)) {
      updateFormData({
        dietaryRestrictions: currentRestrictions.filter(
          (id) => id !== restrictionId
        ),
      });
    } else {
      updateFormData({
        dietaryRestrictions: [...currentRestrictions, restrictionId],
      });
    }
  };

  const handleOtherRestrictionsChange = (value: string) => {
    updateFormData({ otherRestrictions: value });
  };

  const filteredRestrictions = commonRestrictions.filter((restriction) =>
    restriction.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canProceed = true; // This step is optional

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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Foods That Work for Your Body
          </h2>
          <p className="text-lg text-sage-700">
            Are there any foods you avoid or can't eat?
          </p>
          <p className="text-sage-600 mt-2">
            This helps us suggest meals that work for your body
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dietary preferences..."
              className="w-full px-4 py-3 pl-12 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors"
            />
            <svg
              className="w-5 h-5 text-sage-400 absolute left-4 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Dietary Restrictions Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {filteredRestrictions.map((restriction) => (
            <button
              key={restriction.id}
              onClick={() => handleRestrictionToggle(restriction.id)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all duration-200 hover:transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sage-300
                ${
                  formData.dietaryRestrictions.includes(restriction.id)
                    ? "border-sage-500 bg-sage-100 text-sage-800 shadow-lg"
                    : "border-sage-200 bg-white text-sage-700 hover:border-sage-300 hover:bg-sage-50"
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{restriction.icon}</div>
                <span className="font-medium">{restriction.label}</span>
                {formData.dietaryRestrictions.includes(restriction.id) && (
                  <div className="ml-auto text-sage-600">
                    <svg
                      className="w-5 h-5"
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

        {/* Other Restrictions Input */}
        <div className="mb-8">
          <button
            onClick={() => setShowOtherInput(!showOtherInput)}
            className="w-full p-4 border-2 border-dashed border-sage-300 rounded-xl text-sage-600 hover:border-sage-400 hover:text-sage-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">✨</span>
              <span className="font-medium">
                Add other dietary considerations
              </span>
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
                value={formData.otherRestrictions}
                onChange={(e) => handleOtherRestrictionsChange(e.target.value)}
                placeholder="Tell us about any other foods you avoid or can't eat..."
                className="w-full p-4 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors resize-none"
                rows={3}
              />
            </motion.div>
          )}
        </div>

        {/* Helpful Information */}
        <div className="bg-sage-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-sage-800 mb-2 text-center">
            💡 Why We Ask This
          </h3>
          <p className="text-sage-700 text-center">
            Understanding your dietary needs helps us create meal suggestions
            that honor your body and preferences. We want every recommendation
            to feel supportive and accessible to you.
          </p>
        </div>

        {/* Encouraging Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            "Your body knows what works for it. We're here to honor that wisdom
            and support your nourishment journey."
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
            disabled={isLoading}
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
