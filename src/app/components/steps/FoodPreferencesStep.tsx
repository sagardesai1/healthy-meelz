"use client";

import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface FoodPreferencesStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

const exampleFoods = [
  "scrambled eggs with toast",
  "pasta with olive oil",
  "roasted vegetables",
  "smoothies with banana",
  "grilled chicken salad",
  "soup and crackers",
  "yogurt with berries",
  "rice and beans",
  "avocado toast",
  "simple stir-fry",
];

export default function FoodPreferencesStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: FoodPreferencesStepProps) {
  const handleGoToMealsChange = (value: string) => {
    updateFormData({ goToMeals: value });
  };

  const addExampleFood = (food: string) => {
    const currentFoods = formData.goToMeals;
    if (currentFoods.includes(food)) return;

    const separator = currentFoods ? ", " : "";
    updateFormData({ goToMeals: currentFoods + separator + food });
  };

  const canProceed = formData.goToMeals.trim() !== "";

  return (
    <div className="max-w-3xl mx-auto">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Foods That Feel Good
          </h2>
          <p className="text-lg text-sage-700">
            What are some foods or meals that always feel good to you?
          </p>
        </div>

        {/* Main Input */}
        <div className="bg-white rounded-xl p-6 border border-sage-200 mb-8">
          <label className="block text-sm font-medium text-sage-700 mb-3">
            Your Go-to Meals & Staples
          </label>
          <p className="text-sage-600 mb-4">
            These will help us personalize suggestions that feel familiar and
            comforting
          </p>

          <textarea
            value={formData.goToMeals}
            onChange={(e) => handleGoToMealsChange(e.target.value)}
            placeholder="E.g., scrambled eggs with toast, pasta with olive oil, roasted vegetables, smoothies with banana..."
            className="w-full p-4 border border-sage-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors resize-none"
            rows={6}
          />

          <p className="text-xs text-sage-500 mt-2">
            Don't worry about being specific - just share what comes to mind
          </p>
        </div>

        {/* Example Foods */}
        <div className="bg-sage-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-sage-800 mb-4 text-center">
            💡 Need some inspiration? Try these:
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {exampleFoods.map((food) => (
              <button
                key={food}
                onClick={() => addExampleFood(food)}
                className="px-3 py-2 bg-white border border-sage-200 rounded-full text-sm text-sage-700 hover:border-sage-400 hover:bg-sage-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-300"
              >
                {food}
              </button>
            ))}
          </div>
          <p className="text-center text-sage-600 mt-4 text-sm">
            Click any food above to add it to your list
          </p>
        </div>

        {/* Encouraging Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            "The foods that feel good to you are your body's way of saying
            'thank you.' Honor that wisdom."
          </p>
        </div>

        {/* Helpful Tip */}
        <div className="bg-white rounded-xl p-6 border border-sage-200 mb-8">
          <h3 className="font-semibold text-sage-800 mb-2 text-center">
            🌟 Remember
          </h3>
          <p className="text-sage-700 text-center">
            There are no "good" or "bad" foods here. We're celebrating what
            nourishes your body and brings you comfort. Your preferences are
            perfect exactly as they are.
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
