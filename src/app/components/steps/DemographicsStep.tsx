"use client";

import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";
import { useState } from "react";
import {
  calculateMacroGoals,
  formatMacroGoals,
  MacroGoals,
} from "../../../lib/macroCalculator";
import { saveUserProfile } from "../../../lib/userService";

interface DemographicsStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

const activityLevels = [
  {
    id: "sedentary",
    label: "Sedentary",
    description: "Little to no exercise, desk job",
    multiplier: 1.2,
  },
  {
    id: "lightly-active",
    label: "Lightly Active",
    description: "Light exercise 1-3 days/week",
    multiplier: 1.375,
  },
  {
    id: "moderately-active",
    label: "Moderately Active",
    description: "Moderate exercise 3-5 days/week",
    multiplier: 1.55,
  },
  {
    id: "very-active",
    label: "Very Active",
    description: "Heavy exercise 6-7 days/week",
    multiplier: 1.725,
  },
  {
    id: "extremely-active",
    label: "Extremely Active",
    description: "Very heavy exercise, physical job",
    multiplier: 1.9,
  },
];

const goals = [
  {
    id: "weight-loss",
    label: "Weight Loss",
    description: "Lose weight and build lean muscle",
    icon: "🔥",
  },
  {
    id: "muscle-gain",
    label: "Muscle Gain",
    description: "Build muscle and strength",
    icon: "💪",
  },
  {
    id: "weight-gain",
    label: "Weight Gain",
    description: "Gain healthy weight",
    icon: "📈",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description: "Maintain current weight and health",
    icon: "⚖️",
  },
];

const genders = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
  { id: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function DemographicsStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: DemographicsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.age || formData.age < 13 || formData.age > 120) {
      newErrors.age = "Please enter a valid age between 13 and 120";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (
      !formData.height?.feet ||
      formData.height.feet < 3 ||
      formData.height.feet > 8
    ) {
      newErrors.height = "Please enter a valid height";
    }

    if (!formData.weight || formData.weight < 50 || formData.weight > 500) {
      newErrors.weight = "Please enter a valid weight between 50-500 lbs";
    }

    if (!formData.activityLevel) {
      newErrors.activityLevel = "Please select your activity level";
    }

    if (!formData.goal) {
      newErrors.goal = "Please select your goal";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateForm()) {
      setIsSaving(true);

      try {
        // Calculate macro goals
        const macroGoals = calculateMacroGoals({
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          activityLevel: formData.activityLevel,
          goal: formData.goal,
        });

        // Update form data with calculated macro goals
        const updatedFormData = { ...formData, macroGoals };
        updateFormData({ macroGoals });

        // Save to database
        await saveUserProfile(updatedFormData);

        // Proceed to next step
        onNext();
      } catch (error) {
        console.error("Error saving user profile:", error);
        setErrors({
          general: "Failed to save your profile. Please try again.",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const canProceed =
    formData.age > 0 &&
    formData.gender &&
    (formData.height?.feet || 0) > 0 &&
    formData.weight > 0 &&
    formData.activityLevel &&
    formData.goal;

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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Tell Us About Yourself
          </h2>
          <p className="text-lg text-sage-700">
            This helps us calculate your personalized macro goals
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-8">
          {/* Age */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <label className="block text-lg font-semibold text-sage-800 mb-3">
              Age
            </label>
            <input
              type="number"
              value={formData.age || ""}
              onChange={(e) =>
                updateFormData({ age: parseInt(e.target.value) || 0 })
              }
              placeholder="Enter your age"
              className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sage-900 ${
                errors.age ? "border-red-300" : "border-sage-300"
              }`}
              min="13"
              max="120"
            />
            {errors.age && (
              <p className="text-red-500 text-sm mt-2">{errors.age}</p>
            )}
          </div>

          {/* Gender */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <label className="block text-lg font-semibold text-sage-800 mb-4">
              Gender
            </label>
            <div className="grid grid-cols-2 gap-3">
              {genders.map((gender) => (
                <button
                  key={gender.id}
                  onClick={() => updateFormData({ gender: gender.id })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.gender === gender.id
                      ? "border-sage-500 bg-sage-50 text-sage-800"
                      : "border-sage-200 hover:border-sage-300 text-sage-700"
                  }`}
                >
                  {gender.label}
                </button>
              ))}
            </div>
            {errors.gender && (
              <p className="text-red-500 text-sm mt-2">{errors.gender}</p>
            )}
          </div>

          {/* Height */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <label className="block text-lg font-semibold text-sage-800 mb-4">
              Height
            </label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="block text-sm text-sage-600 mb-2">Feet</label>
                <select
                  value={formData.height?.feet || 0}
                  onChange={(e) =>
                    updateFormData({
                      height: {
                        feet: parseInt(e.target.value) || 0,
                        inches: formData.height?.inches || 0,
                      },
                    })
                  }
                  className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sage-900 ${
                    errors.height ? "border-red-300" : "border-sage-300"
                  }`}
                >
                  <option value={0}>Select feet</option>
                  {Array.from({ length: 6 }, (_, i) => i + 3).map((feet) => (
                    <option key={feet} value={feet}>
                      {feet} ft
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm text-sage-600 mb-2">
                  Inches
                </label>
                <select
                  value={formData.height?.inches || 0}
                  onChange={(e) =>
                    updateFormData({
                      height: {
                        feet: formData.height?.feet || 0,
                        inches: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sage-900 ${
                    errors.height ? "border-red-300" : "border-sage-300"
                  }`}
                >
                  <option value={0}>Select inches</option>
                  {Array.from({ length: 12 }, (_, i) => i).map((inches) => (
                    <option key={inches} value={inches}>
                      {inches} in
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {errors.height && (
              <p className="text-red-500 text-sm mt-2">{errors.height}</p>
            )}
          </div>

          {/* Weight */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <label className="block text-lg font-semibold text-sage-800 mb-3">
              Current Weight
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={formData.weight || ""}
                onChange={(e) =>
                  updateFormData({ weight: parseFloat(e.target.value) || 0 })
                }
                placeholder="Enter your weight"
                className={`flex-1 p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sage-900 ${
                  errors.weight ? "border-red-300" : "border-sage-300"
                }`}
                min="50"
                max="500"
              />
              <span className="text-sage-600 font-medium">lbs</span>
            </div>
            {errors.weight && (
              <p className="text-red-500 text-sm mt-2">{errors.weight}</p>
            )}
          </div>

          {/* Activity Level */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <label className="block text-lg font-semibold text-sage-800 mb-4">
              Activity Level
            </label>
            <div className="space-y-3">
              {activityLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => updateFormData({ activityLevel: level.id })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.activityLevel === level.id
                      ? "border-sage-500 bg-sage-50"
                      : "border-sage-200 hover:border-sage-300"
                  }`}
                >
                  <div className="font-medium text-sage-800">{level.label}</div>
                  <div className="text-sm text-sage-600">
                    {level.description}
                  </div>
                </button>
              ))}
            </div>
            {errors.activityLevel && (
              <p className="text-red-500 text-sm mt-2">
                {errors.activityLevel}
              </p>
            )}
          </div>

          {/* Goal */}
          <div className="bg-white rounded-xl p-6 border border-sage-200">
            <label className="block text-lg font-semibold text-sage-800 mb-4">
              What's Your Goal?
            </label>
            <div className="grid grid-cols-2 gap-4">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => updateFormData({ goal: goal.id })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    formData.goal === goal.id
                      ? "border-sage-500 bg-sage-50"
                      : "border-sage-200 hover:border-sage-300"
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{goal.icon}</span>
                    <div className="font-medium text-sage-800">
                      {goal.label}
                    </div>
                  </div>
                  <div className="text-sm text-sage-600">
                    {goal.description}
                  </div>
                </button>
              ))}
            </div>
            {errors.goal && (
              <p className="text-red-500 text-sm mt-2">{errors.goal}</p>
            )}
          </div>
        </div>

        {/* Encouraging Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            With this information, we'll create a personalized nutrition plan
            tailored to your goals and lifestyle.
          </p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-center">{errors.general}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={onPrev}
            className="px-6 py-3 text-sage-600 hover:text-sage-800 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sage-300 rounded-lg"
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed || isSaving}
            className="bg-gradient-to-r from-sage-500 to-coral-500 hover:from-sage-600 hover:to-coral-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sage-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? "Saving..." : "Complete & Continue"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
