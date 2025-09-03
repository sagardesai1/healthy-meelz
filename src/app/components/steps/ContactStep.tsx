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

const countryCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+61", country: "AU" },
  { code: "+91", country: "IN" },
  { code: "+86", country: "CN" },
  { code: "+81", country: "JP" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+39", country: "IT" },
  { code: "+34", country: "ES" },
];

export default function ContactStep({
  formData,
  updateFormData,
  onNext,
  onPrev,
  isLoading,
}: ContactStepProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState("+1");
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneInput, setPhoneInput] = useState("");

  // Initialize phone input only once when component mounts
  useEffect(() => {
    if (formData.phoneNumber && !phoneInput) {
      const phoneWithoutCode = formData.phoneNumber.replace(/^\+\d+/, "");
      setPhoneInput(phoneWithoutCode);
    }
  }, []); // Empty dependency array - only run once

  const handlePhoneChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, "");

    // Limit to 10 digits
    if (cleaned.length > 10) return;

    setPhoneInput(cleaned);

    // Update form data with full phone number
    const fullPhoneNumber = selectedCountryCode + cleaned;
    updateFormData({ phoneNumber: fullPhoneNumber });

    // Clear error when user starts typing
    if (phoneError) setPhoneError("");
  };

  const handleCountryCodeSelect = (code: string) => {
    setSelectedCountryCode(code);
    setShowCountrySelector(false);

    // Update phone number with new country code
    const fullPhoneNumber = code + phoneInput;
    updateFormData({ phoneNumber: fullPhoneNumber });
  };

  const validatePhoneNumber = () => {
    if (!phoneInput || phoneInput.length !== 10) {
      setPhoneError("Please enter a complete 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validatePhoneNumber()) {
      onNext();
    }
  };

  const formatPhoneDisplay = (digits: string) => {
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const canProceed = phoneInput.length === 10;

  return (
    <div className="max-w-2xl mx-auto">
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-sage-800 mb-3">
            Stay Connected
          </h2>
          <p className="text-lg text-sage-700">
            We'll send you personalized grocery lists and meal planning support
          </p>
        </div>

        {/* Phone Number Input */}
        <div className="bg-white rounded-xl p-6 border border-sage-200 mb-8">
          <label className="block text-sm font-medium text-sage-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-sage-600 mb-4">
            For personalized grocery lists and meal planning support
          </p>

          <div className="flex space-x-3">
            {/* Country Code Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountrySelector(!showCountrySelector)}
                className="flex items-center space-x-2 px-3 py-3 border border-sage-300 rounded-lg bg-white hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors"
              >
                <span className="text-sage-700 font-medium">
                  {selectedCountryCode}
                </span>
                <svg
                  className="w-4 h-4 text-sage-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showCountrySelector && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-sage-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {countryCodes.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountryCodeSelect(country.code)}
                      className="w-full px-4 py-2 text-left hover:bg-sage-50 focus:bg-sage-50 focus:outline-none transition-colors"
                    >
                      <span className="font-medium text-sage-700">
                        {country.code}
                      </span>
                      <span className="text-sm text-sage-500 ml-2">
                        ({country.country})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone Number Input */}
            <input
              type="tel"
              value={formatPhoneDisplay(phoneInput)}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(555) 123-4567"
              className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-colors ${
                phoneError ? "border-red-300" : "border-sage-300"
              }`}
            />
          </div>

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

          <p className="text-xs text-sage-500 mt-2">
            We'll send you personalized grocery lists and meal planning tips
          </p>
        </div>

        {/* Encouraging Message */}
        <div className="bg-coral-50 rounded-xl p-6 mb-8 text-center">
          <p className="text-coral-800 font-medium">
            "Your phone number helps us send you personalized grocery lists that
            match your preferences and goals."
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
