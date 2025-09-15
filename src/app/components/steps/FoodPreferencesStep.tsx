"use client";

import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";
import { useState } from "react";

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

const commonIngredients = [
  "eggs",
  "bread",
  "oatmeal",
  "yogurt",
  "banana",
  "berries",
  "avocado",
  "chicken",
  "rice",
  "pasta",
  "olive oil",
  "cheese",
  "tomatoes",
  "spinach",
  "onions",
  "garlic",
  "quinoa",
  "beans",
  "salmon",
  "sweet potato",
];

export default function FoodPreferencesStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: FoodPreferencesStepProps) {
  const [newIngredient, setNewIngredient] = useState("");

  const addIngredient = (
    mealType: "breakfast" | "lunch" | "dinner",
    ingredient: string
  ) => {
    const currentIngredients =
      (formData[`${mealType}Ingredients` as keyof FormData] as string[]) || [];
    if (currentIngredients.includes(ingredient)) return;

    updateFormData({
      [`${mealType}Ingredients`]: [...currentIngredients, ingredient],
    });
  };

  const removeIngredient = (
    mealType: "breakfast" | "lunch" | "dinner",
    ingredient: string
  ) => {
    const currentIngredients =
      (formData[`${mealType}Ingredients` as keyof FormData] as string[]) || [];
    updateFormData({
      [`${mealType}Ingredients`]: currentIngredients.filter(
        (item) => item !== ingredient
      ),
    });
  };

  const handleAddCustomIngredient = (
    mealType: "breakfast" | "lunch" | "dinner"
  ) => {
    if (newIngredient.trim()) {
      addIngredient(mealType, newIngredient.trim());
      setNewIngredient("");
    }
  };

  const canProceed =
    (formData.breakfastIngredients?.length || 0) > 0 ||
    (formData.lunchIngredients?.length || 0) > 0 ||
    (formData.dinnerIngredients?.length || 0) > 0;

  const renderMealSection = (
    mealType: "breakfast" | "lunch" | "dinner",
    title: string,
    emoji: string,
    placeholder: string
  ) => {
    const ingredients =
      (formData[`${mealType}Ingredients` as keyof FormData] as string[]) || [];

    return (
      <div className="bg-white rounded-xl p-6 border border-sage-200 mb-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{emoji}</span>
          <h3 className="text-xl font-semibold text-sage-800">{title}</h3>
        </div>

        <p className="text-sage-600 mb-4">
          What ingredients do you typically use for {mealType}?
        </p>

        {/* Selected Ingredients */}
        {ingredients.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="inline-flex items-center px-3 py-2 bg-sage-100 text-sage-800 rounded-full text-sm"
                >
                  {ingredient}
                  <button
                    onClick={() => removeIngredient(mealType, ingredient)}
                    className="ml-2 text-sage-600 hover:text-sage-800 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Common Ingredients */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-sage-700 mb-2">
            Common ingredients:
          </h4>
          <div className="flex flex-wrap gap-2">
            {commonIngredients.map((ingredient) => (
              <button
                key={ingredient}
                onClick={() => addIngredient(mealType, ingredient)}
                disabled={ingredients.includes(ingredient)}
                className="px-3 py-2 bg-sage-50 border border-sage-200 rounded-full text-sm text-sage-700 hover:border-sage-400 hover:bg-sage-100 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ingredient}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Ingredient Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            placeholder={placeholder}
            className="flex-1 p-3 border border-sage-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sage-900"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddCustomIngredient(mealType);
              }
            }}
          />
          <button
            onClick={() => handleAddCustomIngredient(mealType)}
            disabled={!newIngredient.trim()}
            className="px-4 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    );
  };

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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Your Go-to Meals & Ingredients
          </h2>
          <p className="text-lg text-sage-700">
            Tell us about the ingredients you use for breakfast, lunch, and
            dinner
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {renderMealSection(
            "breakfast",
            "Breakfast",
            "🌅",
            "Add a breakfast ingredient..."
          )}
          {renderMealSection(
            "lunch",
            "Lunch",
            "🌞",
            "Add a lunch ingredient..."
          )}
          {renderMealSection(
            "dinner",
            "Dinner",
            "🌙",
            "Add a dinner ingredient..."
          )}
        </div>

        {/* Personalized Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            We are crafting the most personalized meals for you based on the
            ingredients and meals you love, and also making swaps easier for you
            so you're not eating the same foods.
          </p>
        </div>

        {/* Helpful Tip */}
        <div className="bg-white rounded-xl p-6 border border-sage-200 mb-8">
          <h3 className="font-semibold text-sage-800 mb-2 text-center">
            🌟 Remember
          </h3>
          <p className="text-sage-700 text-center">
            The more specific you are about your ingredients, the better we can
            tailor our recommendations to your preferences and dietary needs.
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
