"use client";

import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface WelcomeStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

export default function WelcomeStep({ onNext, isLoading }: WelcomeStepProps) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Welcome Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-sage-400 to-coral-400 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-sage-800 mb-6">
          Welcome to Your Nourishment Journey
        </h2>

        <p className="text-lg text-sage-700 mb-8 leading-relaxed">
          We're so glad you're here. The details of your answers will help us
          create a weekly plan that fits seamlessly into your life. This
          questionnaire is designed to understand your unique relationship with
          food and create a personalized experience that honors your body, your
          preferences, and your journey.
        </p>

        <div className="bg-sage-50 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-sage-800 mb-3 text-center">
            What to expect:
          </h3>
          <ul className="space-y-2 text-sage-700">
            <li className="flex items-start">
              <span className="text-sage-500 mr-2">•</span>
              <span>About 5-10 minutes to complete</span>
            </li>
            <li className="flex items-start">
              <span className="text-sage-500 mr-2">•</span>
              <span>Your progress is automatically saved</span>
            </li>
            <li className="flex items-start">
              <span className="text-sage-500 mr-2">•</span>
              <span>You can skip any question that doesn't feel right</span>
            </li>
            <li className="flex items-start">
              <span className="text-sage-500 mr-2">•</span>
              <span>There are no wrong answers - only your truth</span>
            </li>
          </ul>
        </div>

        <div className="bg-coral-50 rounded-xl p-6 mb-8">
          <p className="text-coral-800 italic font-medium">
            "Your relationship with food is unique, and that's exactly right.
            Let's discover what works for you."
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={isLoading}
          className="bg-gradient-to-r from-sage-500 to-coral-500 hover:from-sage-600 hover:to-coral-600 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sage-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Getting Ready..." : "Begin Your Journey"}
        </button>

        <p className="text-sm text-sage-600 mt-4">
          Take your time - this is about you and your wellbeing
        </p>
      </motion.div>
    </div>
  );
}
