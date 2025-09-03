"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface JoyFoodsStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

const suggestedJoyFoods = [
  "chocolate",
  "fresh berries",
  "warm soup",
  "crunchy things",
  "creamy textures",
  "spicy flavors",
  "herbs and spices",
  "citrus",
  "nuts",
  "cheese",
  "bread",
  "pasta",
  "rice",
  "eggs",
  "avocado",
  "tomatoes",
  "onions",
  "garlic",
  "olive oil",
  "butter",
  "honey",
  "maple syrup",
];

export default function JoyFoodsStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: JoyFoodsStepProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddJoyFood = (food: string) => {
    if (food.trim() && !formData.joyFoods.includes(food.trim().toLowerCase())) {
      updateFormData({
        joyFoods: [...formData.joyFoods, food.trim().toLowerCase()],
      });
    }
  };

  const handleRemoveJoyFood = (foodToRemove: string) => {
    updateFormData({
      joyFoods: formData.joyFoods.filter((food) => food !== foodToRemove),
    });
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleAddJoyFood(inputValue);
      setInputValue("");
    }
  };

  const handleSuggestedFoodClick = (food: string) => {
    handleAddJoyFood(food);
  };

  const canProceed = formData.joyFoods.length > 0;

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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Foods That Bring You Joy
          </h2>
          <p className="text-lg text-sage-700">What foods make you happy?</p>
          <p className="text-sage-600 mt-2">
            Nourishment includes foods that make you happy!
          </p>
        </div>

        {/* Current Joy Foods Display */}
        {formData.joyFoods.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-sage-200 mb-8">
            <h3 className="text-lg font-semibold text-sage-800 mb-4 text-center">
              Your Joy Foods ✨
            </h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {formData.joyFoods.map((food) => (
                <div
                  key={food}
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-coral-100 to-sage-100 border border-coral-200 rounded-full text-coral-800 font-medium"
                >
                  <span>{food}</span>
                  <button
                    onClick={() => handleRemoveJoyFood(food)}
                    className="text-coral-600 hover:text-coral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-coral-300 rounded-full"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Joy Food */}
        <div className="bg-white rounded-xl p-6 border border-sage-200 mb-8">
          <h3 className="text-lg font-semibold text-sage-800 mb-4 text-center">
            Add More Joy Foods
          </h3>

          <form onSubmit={handleInputSubmit} className="mb-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a food that brings you joy..."
                className="flex-1 px-4 py-3 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors text-sage-900"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-6 py-3 bg-gradient-to-r from-sage-500 to-coral-500 hover:from-sage-600 hover:to-coral-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sage-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Add
              </button>
            </div>
          </form>

          <p className="text-sm text-sage-600 text-center">
            Press Enter or click Add to include it in your list
          </p>
        </div>

        {/* Suggested Joy Foods */}
        <div className="bg-sage-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-sage-800 mb-4 text-center">
            💡 Need inspiration? Try these:
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestedJoyFoods.map((food) => (
              <button
                key={food}
                onClick={() => handleSuggestedFoodClick(food)}
                disabled={formData.joyFoods.includes(food)}
                className={`
                  px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sage-300
                  ${
                    formData.joyFoods.includes(food)
                      ? "bg-sage-200 text-sage-500 cursor-not-allowed"
                      : "bg-white border border-sage-200 text-sage-700 hover:border-sage-400 hover:bg-sage-100 hover:transform hover:scale-105"
                  }
                `}
              >
                {food}
              </button>
            ))}
          </div>
          <p className="text-center text-sage-600 mt-4 text-sm">
            Click any food above to add it to your joy list
          </p>
        </div>

        {/* Encouraging Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            "Joy is an essential ingredient in nourishment. Celebrate the foods
            that make your heart sing!"
          </p>
        </div>

        {/* Helpful Information */}
        <div className="bg-white rounded-xl p-6 border border-sage-200 mb-8">
          <h3 className="font-semibold text-sage-800 mb-2 text-center">
            🌟 Why Joy Foods Matter
          </h3>
          <p className="text-sage-700 text-center">
            Including foods you love in your nourishment journey makes eating
            feel more satisfying and sustainable. When food brings you joy, it's
            easier to build a positive relationship with eating.
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
