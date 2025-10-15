"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FormData } from "../OnboardingQuestionnaire";

interface ContactStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

export default function ContactStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: ContactStepProps) {
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailError, setEmailError] = useState("");

  // Initialize phone input only once when component mounts
  useEffect(() => {
    if (formData.phoneNumber && !phoneInput) {
      setPhoneInput(formData.phoneNumber);
    }
  }, []); // Empty dependency array - only run once

  const handleNameChange = (value: string) => {
    updateFormData({ name: value });
    if (nameError) setNameError("");
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, "");

    // Limit to 10 digits
    if (cleaned.length > 10) return;

    setPhoneInput(cleaned);

    // Update form data with phone number
    updateFormData({ phoneNumber: cleaned });

    // Clear error when user starts typing
    if (phoneError) setPhoneError("");
  };

  const validateName = () => {
    if (!formData.name || formData.name.trim().length < 2) {
      setNameError("Please enter your full name");
      return false;
    }
    return true;
  };

  const validatePhoneNumber = () => {
    if (!phoneInput || phoneInput.length !== 10) {
      setPhoneError("Please enter a complete 10-digit phone number");
      return false;
    }
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    updateFormData({ email: value });
    if (emailError) setEmailError("");
  };

  const handleNext = () => {
    const nameValid = validateName();
    const phoneValid = validatePhoneNumber();

    let emailValid = true;
    if (!formData.email || !validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address");
      emailValid = false;
    }

    if (nameValid && phoneValid && emailValid) {
      onNext();
    }
  };

  const formatPhoneDisplay = (digits: string) => {
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const canProceed =
    formData.name &&
    formData.name.trim().length >= 2 &&
    phoneInput.length === 10 &&
    formData.email &&
    validateEmail(formData.email);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-sage-400 to-coral-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 text-white"
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
          <h2 className="text-2xl sm:text-3xl font-bold text-sage-800 mb-3">
            Let's Get Started
          </h2>
          <p className="text-base sm:text-lg text-sage-700">
            Tell us a bit about yourself so we can personalize your meal
            planning experience
          </p>
        </div>

        {/* Name Input */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-sage-200 mb-6">
          <label className="block text-sm font-medium text-sage-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors text-sage-900 ${
              nameError ? "border-red-300" : "border-sage-300"
            }`}
          />

          {/* Error Message */}
          {nameError && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {nameError}
            </p>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-sage-200 mb-8">
          <label className="block text-sm font-medium text-sage-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>

          {/* Phone Number Input */}
          <input
            type="tel"
            value={formatPhoneDisplay(phoneInput)}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(555) 123-4567"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors text-sage-900 ${
              phoneError ? "border-red-300" : "border-sage-300"
            }`}
          />

          {/* Error Message */}
          {phoneError && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {phoneError}
            </p>
          )}
        </div>

        {/* Email Input */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-sage-200 mb-6">
          <label className="block text-sm font-medium text-sage-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <p className="text-sage-600 mb-4">
            We'll send you personalized meal planning reminders and helpful tips
          </p>

          <input
            type="email"
            value={formData.email || ""}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="your.email@example.com"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors text-sage-900 ${
              emailError ? "border-red-300" : "border-sage-300"
            }`}
          />
          {emailError && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {emailError}
            </p>
          )}
        </div>

        {/* Privacy Reassurance */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            "We'll never send unwanted texts or spam - only helpful meal
            planning support when you need it most."
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
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className="bg-gradient-to-r from-sage-500 to-coral-500 hover:from-sage-600 hover:to-coral-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sage-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? "Continuing..." : "Continue"}
          </button>
        </div>

        {/* Required Field Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-sage-600">
            <span className="text-red-500">*</span> Required field
          </p>
        </div>
      </motion.div>
    </div>
  );
}
