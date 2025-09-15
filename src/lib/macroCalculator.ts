export interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  bmr: number;
  tdee: number;
}

export interface Demographics {
  age: number;
  gender: string;
  height: {
    feet: number;
    inches: number;
  };
  weight: number;
  activityLevel: string;
  goal: string;
}

// Activity level multipliers
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  "lightly-active": 1.375,
  "moderately-active": 1.55,
  "very-active": 1.725,
  "extremely-active": 1.9,
};

// Macro ratios based on goals
const MACRO_RATIOS = {
  "weight-loss": { protein: 0.3, carbs: 0.35, fat: 0.35 }, // Higher protein for muscle preservation
  "muscle-gain": { protein: 0.25, carbs: 0.45, fat: 0.3 }, // Higher carbs for energy
  "weight-gain": { protein: 0.2, carbs: 0.5, fat: 0.3 }, // Higher carbs for surplus
  maintenance: { protein: 0.25, carbs: 0.4, fat: 0.35 }, // Balanced approach
};

/**
 * Calculate BMR using the Mifflin-St Jeor Equation
 * Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
 * Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
 */
export function calculateBMR(demographics: Demographics): number {
  const { age, gender, height, weight } = demographics;

  // Convert weight from lbs to kg
  const weightKg = weight * 0.453592;

  // Convert height from feet/inches to cm
  const heightCm = (height.feet * 12 + height.inches) * 2.54;

  // Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;

  // Add gender adjustment
  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  return Math.round(bmr);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * TDEE = BMR × Activity Multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
  const multiplier =
    ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS] ||
    1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily calorie target based on goal
 */
export function calculateCalorieTarget(tdee: number, goal: string): number {
  switch (goal) {
    case "weight-loss":
      return Math.round(tdee - 500); // 500 calorie deficit for ~1lb/week loss
    case "weight-gain":
      return Math.round(tdee + 300); // 300 calorie surplus for healthy gain
    case "muscle-gain":
      return Math.round(tdee + 200); // 200 calorie surplus for lean muscle
    case "maintenance":
    default:
      return tdee;
  }
}

/**
 * Calculate macro distribution in grams
 */
export function calculateMacroGrams(
  calories: number,
  macroRatio: { protein: number; carbs: number; fat: number }
) {
  // Protein: 4 calories per gram
  // Carbs: 4 calories per gram
  // Fat: 9 calories per gram

  const proteinCalories = calories * macroRatio.protein;
  const carbsCalories = calories * macroRatio.carbs;
  const fatCalories = calories * macroRatio.fat;

  return {
    proteinGrams: Math.round(proteinCalories / 4),
    carbsGrams: Math.round(carbsCalories / 4),
    fatGrams: Math.round(fatCalories / 9),
  };
}

/**
 * Main function to calculate all macro goals
 */
export function calculateMacroGoals(demographics: Demographics): MacroGoals {
  const { goal } = demographics;

  // Calculate BMR and TDEE
  const bmr = calculateBMR(demographics);
  const tdee = calculateTDEE(bmr, demographics.activityLevel);

  // Calculate calorie target based on goal
  const calories = calculateCalorieTarget(tdee, goal);

  // Get macro ratios for the goal
  const macroRatio =
    MACRO_RATIOS[goal as keyof typeof MACRO_RATIOS] || MACRO_RATIOS.maintenance;

  // Calculate macro grams
  const macroGrams = calculateMacroGrams(calories, macroRatio);

  return {
    calories,
    protein: Math.round(macroRatio.protein * 100), // Percentage
    carbs: Math.round(macroRatio.carbs * 100), // Percentage
    fat: Math.round(macroRatio.fat * 100), // Percentage
    proteinGrams: macroGrams.proteinGrams,
    carbsGrams: macroGrams.carbsGrams,
    fatGrams: macroGrams.fatGrams,
    bmr,
    tdee,
  };
}

/**
 * Format macro goals for display
 */
export function formatMacroGoals(macroGoals: MacroGoals) {
  return {
    summary: `${macroGoals.calories} calories per day`,
    breakdown: {
      protein: `${macroGoals.proteinGrams}g protein (${macroGoals.protein}%)`,
      carbs: `${macroGoals.carbsGrams}g carbs (${macroGoals.carbs}%)`,
      fat: `${macroGoals.fatGrams}g fat (${macroGoals.fat}%)`,
    },
    details: {
      bmr: `${macroGoals.bmr} calories (BMR)`,
      tdee: `${macroGoals.tdee} calories (TDEE)`,
      target: `${macroGoals.calories} calories (Daily Target)`,
    },
  };
}
