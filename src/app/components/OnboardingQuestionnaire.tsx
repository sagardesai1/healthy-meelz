"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeStep from "./steps/WelcomeStep";
import ContactStep from "./steps/ContactStep";
import PlanningStep from "./steps/PlanningStep";
import GoalsStep from "./steps/GoalsStep";
import DietaryStep from "./steps/DietaryStep";
import HouseholdStep from "./steps/HouseholdStep";
import FoodPreferencesStep from "./steps/FoodPreferencesStep";
import TimePreferencesStep from "./steps/TimePreferencesStep";
import JoyFoodsStep from "./steps/JoyFoodsStep";
import SummaryStep from "./steps/SummaryStep";
import ProgressIndicator from "./ProgressIndicator";

export interface FormData {
  // Contact Information
  phoneNumber: string;

  // Planning Preferences
  planningDay: string;

  // Personal Goals
  goals: string[];
  otherGoal: string;

  // Dietary Considerations
  dietaryRestrictions: string[];
  otherRestrictions: string;

  // Household Information
  householdSize: number;
  mealsPrepared: string[];
  mealPeopleCounts: Record<string, number>;

  // Food Preferences
  goToMeals: string;

  // Time Preferences
  mealPrepTime: string;

  // Joy Foods
  joyFoods: string[];
}

const initialFormData: FormData = {
  phoneNumber: "",
  planningDay: "",
  goals: [],
  otherGoal: "",
  dietaryRestrictions: [],
  otherRestrictions: "",
  householdSize: 1,
  mealsPrepared: [],
  mealPeopleCounts: {},
  goToMeals: "",
  mealPrepTime: "",
  joyFoods: [],
};

const steps = [
  { id: "welcome", title: "Welcome", component: WelcomeStep },
  { id: "contact", title: "Contact", component: ContactStep },
  { id: "planning", title: "Planning", component: PlanningStep },
  { id: "goals", title: "Goals", component: GoalsStep },
  { id: "dietary", title: "Dietary", component: DietaryStep },
  { id: "household", title: "Household", component: HouseholdStep },
  {
    id: "food-preferences",
    title: "Food Preferences",
    component: FoodPreferencesStep,
  },
  {
    id: "time-preferences",
    title: "Time Preferences",
    component: TimePreferencesStep,
  },
  { id: "joy-foods", title: "Joy Foods", component: JoyFoodsStep },
  { id: "summary", title: "Complete", component: SummaryStep },
];

export default function OnboardingQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("wellness-onboarding");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Save progress to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem("wellness-onboarding", JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    // Prevent going to future steps if required fields aren't filled
    if (
      stepIndex === 1 &&
      !(formData.phoneNumber.replace(/^\+\d+/, "").length >= 7)
    ) {
      return; // Can't go to contact step without phone number
    }
    setCurrentStep(stepIndex);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData);
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-coral-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-sage-800 mb-4">
            Welcome to Your Nourishment Journey
          </h1>
          <p className="text-lg text-sage-700 max-w-2xl mx-auto">
            Let's create a personalized experience that honors your unique
            relationship with food
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={steps.length}
          onStepClick={goToStep}
        />

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CurrentStepComponent
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
                onSubmit={handleSubmit}
                isFirstStep={currentStep === 0}
                isLastStep={currentStep === steps.length - 1}
                isLoading={isLoading}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Encouraging Message */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="text-center">
            <p className="text-sage-600 italic">
              "Every small step toward nourishing yourself matters"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
