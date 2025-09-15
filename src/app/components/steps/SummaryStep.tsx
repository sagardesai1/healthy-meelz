"use client";

import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface SummaryStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

const getPlanningDayLabel = (day: string) => {
  const dayMap: { [key: string]: string } = {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    flexible: "I prefer flexibility",
  };
  return dayMap[day] || day;
};

const getGoalsLabels = (goals: string[]) => {
  const goalMap: { [key: string]: string } = {
    "consistent-habits": "Build consistent eating habits",
    "discover-foods": "Discover new nourishing foods",
    "simplify-planning": "Simplify meal planning",
    "cook-more": "Cook more meals at home",
    "kitchen-confidence": "Feel more confident in the kitchen",
    "energy-support": "Support my energy levels",
    "peaceful-meals": "Create peaceful mealtimes",
  };
  return goals.map((goal) => goalMap[goal] || goal);
};

const getMealsLabels = (meals: string[]) => {
  const mealMap: { [key: string]: string } = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
  };
  return meals.map((meal) => mealMap[meal] || meal);
};

const getTimeLabel = (time: string) => {
  const timeMap: { [key: string]: string } = {
    "15-min": "15 minutes or less",
    "15-30-min": "15-30 minutes",
    "30-60-min": "30-60 minutes",
    "1-2-hours": "1-2 hours",
    "2-plus-hours": "2+ hours",
    varies: "It varies",
  };
  return timeMap[time] || time;
};

export default function SummaryStep({
  formData,
  onPrev,
  onSubmit,
  isLoading,
}: SummaryStepProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-sage-400 to-coral-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
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
          <h2 className="text-4xl font-bold text-sage-800 mb-4">
            You Did It! 🎉
          </h2>
          <p className="text-xl text-sage-700">
            Thank you for sharing your nourishment journey with us
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Contact & Planning */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <h3 className="text-lg font-semibold text-sage-800 mb-4 flex items-center">
              <span className="text-sage-500 mr-2">📱</span>
              Contact & Planning
            </h3>
            <div className="space-y-3 text-sm">
              {formData.phoneNumber && (
                <div>
                  <span className="font-medium text-sage-700">Phone:</span>
                  <span className="ml-2 text-sage-600">
                    {formData.phoneNumber}
                  </span>
                  <p className="text-xs text-sage-500 mt-1">
                    For personalized grocery lists and meal planning support
                  </p>
                </div>
              )}
              {formData.planningDay && (
                <div>
                  <span className="font-medium text-sage-700">
                    Planning Day:
                  </span>
                  <span className="ml-2 text-sage-600">
                    {getPlanningDayLabel(formData.planningDay)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <h3 className="text-lg font-semibold text-sage-800 mb-4 flex items-center">
              <span className="text-sage-500 mr-2">🎯</span>
              Your Goals
            </h3>
            <div className="space-y-2">
              {formData.goals.length > 0 &&
                getGoalsLabels(formData.goals).map((goal, index) => (
                  <div key={index} className="text-sm text-sage-600">
                    • {goal}
                  </div>
                ))}
              {formData.otherGoal && (
                <div className="text-sm text-sage-600">
                  • {formData.otherGoal}
                </div>
              )}
            </div>
          </div>

          {/* Dietary & Household */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <h3 className="text-lg font-semibold text-sage-800 mb-4 flex items-center">
              <span className="text-sage-500 mr-2">🏠</span>
              Household & Dietary
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-sage-700">Cooking for:</span>
                <span className="ml-2 text-sage-600">
                  {formData.householdSize}{" "}
                  {formData.householdSize === 1 ? "person" : "people"}
                </span>
              </div>
              {formData.mealsPrepared.length > 0 && (
                <div>
                  <span className="font-medium text-sage-700">
                    Meals prepared:
                  </span>
                  <span className="ml-2 text-sage-600">
                    {getMealsLabels(formData.mealsPrepared).join(", ")}
                  </span>
                </div>
              )}
              {formData.dietaryRestrictions.length > 0 && (
                <div>
                  <span className="font-medium text-sage-700">
                    Dietary considerations:
                  </span>
                  <span className="ml-2 text-sage-600">
                    {formData.dietaryRestrictions.join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <h3 className="text-lg font-semibold text-sage-800 mb-4 flex items-center">
              <span className="text-sage-500 mr-2">❤️</span>
              Your Preferences
            </h3>
            <div className="space-y-3 text-sm">
              {formData.mealPrepTime && (
                <div>
                  <span className="font-medium text-sage-700">Prep time:</span>
                  <span className="ml-2 text-sage-600">
                    {getTimeLabel(formData.mealPrepTime)}
                  </span>
                </div>
              )}
              {formData.joyFoods.length > 0 && (
                <div>
                  <span className="font-medium text-sage-700">Joy foods:</span>
                  <span className="ml-2 text-sage-600">
                    {formData.joyFoods.slice(0, 3).join(", ")}
                    {formData.joyFoods.length > 3 ? "..." : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Celebration Message */}
        <div className="bg-gradient-to-r from-sage-100 to-coral-100 rounded-xl p-8 mb-8 text-center">
          <h3 className="text-2xl font-bold text-sage-800 mb-4">
            Welcome to Your Nourishment Journey! 🌱
          </h3>
          <p className="text-lg text-sage-700 mb-4">
            You've taken a beautiful step toward honoring your relationship with
            food. Every answer you've shared helps us create a more
            personalized, supportive experience for you.
          </p>
          <p className="text-sage-600">
            "There are no wrong answers - we're here to support what works for
            you."
          </p>
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-xl p-6 border border-sage-200 mb-8">
          <h3 className="text-xl font-semibold text-sage-800 mb-4 text-center">
            What Happens Next? ✨
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="w-12 h-12 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-medium text-sage-800 mb-2">
                Personalized Experience
              </h4>
              <p className="text-sm text-sage-600">
                We'll use your responses to customize meal suggestions and
                support
              </p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-medium text-sage-800 mb-2">
                Personalized Grocery Lists
              </h4>
              <p className="text-sm text-sage-600">
                Receive customized grocery lists and meal planning guidance
              </p>
            </div>
            <div className="p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌱</span>
              </div>
              <h4 className="font-medium text-sage-800 mb-2">
                Ongoing Support
              </h4>
              <p className="text-sm text-sage-600">
                Access resources to continue building your nourishment journey
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center">
          <button
            onClick={onPrev}
            className="px-6 py-3 text-sage-600 hover:text-sage-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sage-300 rounded-lg"
          >
            ← Back
          </button>
        </div>

        {/* Final Encouragement */}
        <div className="text-center mt-8">
          <p className="text-sage-600 italic">
            "Every small step toward nourishing yourself matters. You're doing
            beautifully."
          </p>
        </div>
      </motion.div>
    </div>
  );
}
