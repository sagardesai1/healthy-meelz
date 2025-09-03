"use client";

import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface HouseholdStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

const mealOptions = [
  {
    id: "breakfast",
    label: "Breakfast",
    icon: "🌅",
    description: "Morning nourishment",
  },
  { id: "lunch", label: "Lunch", icon: "☀️", description: "Midday fuel" },
  { id: "dinner", label: "Dinner", icon: "🌙", description: "Evening comfort" },
];

export default function HouseholdStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: HouseholdStepProps) {
  const handleMealPeopleChange = (mealId: string, people: number) => {
    const currentMeals = formData.mealsPrepared;
    const currentPeople = formData.mealPeopleCounts?.[mealId] || 0;
    
    // If selecting people for a meal, add it to mealsPrepared
    if (people > 0 && !currentMeals.includes(mealId)) {
      updateFormData({
        mealsPrepared: [...currentMeals, mealId],
        mealPeopleCounts: {
          ...formData.mealPeopleCounts,
          [mealId]: people
        }
      });
    } else if (people === 0) {
      // If setting to 0, remove from mealsPrepared
      updateFormData({
        mealsPrepared: currentMeals.filter(id => id !== mealId),
        mealPeopleCounts: {
          ...formData.mealPeopleCounts,
          [mealId]: 0
        }
      });
    } else {
      // Just update the people count
      updateFormData({
        mealPeopleCounts: {
          ...formData.mealPeopleCounts,
          [mealId]: people
        }
      });
    }
  };

  const canProceed = formData.mealsPrepared.length > 0;

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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Your Household & Cooking
          </h2>
          <p className="text-lg text-sage-700">
            Let's understand your cooking routine and who you're nourishing
          </p>
        </div>

        {/* Meals with People Count */}
        <div className="space-y-6 mb-8">
          {mealOptions.map((meal) => (
            <div key={meal.id} className="bg-white rounded-xl p-6 border border-sage-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-3xl">{meal.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-sage-800">{meal.label}</h3>
                  <p className="text-sage-600">{meal.description}</p>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sage-700 mb-4 font-medium">
                  How many people do you cook {meal.label.toLowerCase()} for?
                </p>
                
                <div className="flex justify-center flex-wrap gap-3">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"].map((size) => (
                    <button
                      key={size}
                      onClick={() => handleMealPeopleChange(meal.id, typeof size === "number" ? size : 10)}
                      className={`
                        w-14 h-14 rounded-full border-2 font-bold text-lg transition-all duration-200 hover:transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sage-300
                        ${
                          (formData.mealPeopleCounts?.[meal.id] || 0) === (typeof size === "number" ? size : 10)
                            ? "border-coral-500 bg-coral-500 text-white shadow-lg"
                            : size === 0
                            ? "border-sage-200 bg-sage-100 text-sage-600"
                            : "border-sage-200 bg-white text-sage-700 hover:border-sage-300 hover:bg-sage-50"
                        }
                      `}
                    >
                      {size === 0 ? "0" : size}
                    </button>
                  ))}
                </div>
                
                {formData.mealPeopleCounts?.[meal.id] > 0 && (
                  <p className="text-coral-600 mt-3 font-medium">
                    Cooking {meal.label.toLowerCase()} for {formData.mealPeopleCounts[meal.id]} {formData.mealPeopleCounts[meal.id] === 1 ? "person" : "people"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Encouraging Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            "Every meal you prepare is an act of love and care. You're creating
            nourishment for yourself and those you love."
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
