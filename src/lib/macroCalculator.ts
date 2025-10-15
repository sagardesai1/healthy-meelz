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

// Goal adjustment percentages
const GOAL_ADJUSTMENTS = {
  "weight-loss": { min: 0.1, max: 0.2 }, // 10-20% deficit
  "muscle-gain": { min: 0.1, max: 0.15 }, // 10-15% surplus (conservative)
  "weight-gain": { min: 0.1, max: 0.15 }, // 10-15% surplus
  maintenance: { min: 0, max: 0 }, // No adjustment
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
 * Uses percentage-based adjustments as specified
 */
export function calculateCalorieTarget(tdee: number, goal: string): number {
  const adjustment =
    GOAL_ADJUSTMENTS[goal as keyof typeof GOAL_ADJUSTMENTS] ||
    GOAL_ADJUSTMENTS.maintenance;

  if (goal === "weight-loss") {
    // Use 15% deficit (middle of 10-20% range) for sustainable weight loss
    return Math.round(tdee * (1 - 0.15));
  } else if (goal === "muscle-gain" || goal === "weight-gain") {
    // Use 12% surplus (middle of 10-15% range) for conservative muscle gain
    return Math.round(tdee * (1 + 0.12));
  } else {
    // Maintenance - no adjustment
    return tdee;
  }
}

/**
 * Calculate macro distribution in grams using protein-per-pound approach
 * Protein: 0.9-1.1g per lb of body weight
 * Fat: 20-25% of total calories
 * Carbs: Remainder of calories
 */
export function calculateMacroGrams(
  calories: number,
  weightLbs: number,
  goal: string
) {
  // Step 1: Calculate protein (0.9-1.1g per lb of body weight)
  // Use 1.0g per lb as the standard (middle of range)
  const proteinGrams = Math.round(weightLbs * 1.0);
  const proteinCalories = proteinGrams * 4; // 4 calories per gram

  // Step 2: Calculate fat (20-25% of total calories)
  // Use 22.5% as the standard (middle of range)
  const fatCalories = calories * 0.225;
  const fatGrams = Math.round(fatCalories / 9); // 9 calories per gram

  // Step 3: Calculate carbs (remainder of calories)
  const carbsCalories = calories - proteinCalories - fatCalories;
  const carbsGrams = Math.round(carbsCalories / 4); // 4 calories per gram

  // Calculate actual percentages for display
  const proteinPercent = Math.round((proteinCalories / calories) * 100);
  const fatPercent = Math.round((fatCalories / calories) * 100);
  const carbsPercent = Math.round((carbsCalories / calories) * 100);

  return {
    proteinGrams,
    carbsGrams,
    fatGrams,
    proteinPercent,
    fatPercent,
    carbsPercent,
  };
}

/**
 * Main function to calculate all macro goals
 * Follows the 5-step process:
 * 1. Calculate BMR using Mifflin-St Jeor equation
 * 2. Calculate TDEE using activity multiplier
 * 3. Adjust for goal (10-20% deficit for weight loss, 10-15% surplus for muscle gain)
 * 4. Determine macro split (protein per lb, fat %, carbs remainder)
 * 5. Convert to grams
 */
export function calculateMacroGoals(demographics: Demographics): MacroGoals {
  const { goal, weight } = demographics;

  // Step 1: Calculate BMR using Mifflin-St Jeor equation
  const bmr = calculateBMR(demographics);

  // Step 2: Calculate TDEE using activity multiplier
  const tdee = calculateTDEE(bmr, demographics.activityLevel);

  // Step 3: Adjust for goal
  const calories = calculateCalorieTarget(tdee, goal);

  // Step 4 & 5: Calculate macro distribution and convert to grams
  const macroGrams = calculateMacroGrams(calories, weight, goal);

  return {
    calories,
    protein: macroGrams.proteinPercent, // Percentage
    carbs: macroGrams.carbsPercent, // Percentage
    fat: macroGrams.fatPercent, // Percentage
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
      bmr: `${macroGoals.bmr} calories (BMR - Mifflin-St Jeor)`,
      tdee: `${macroGoals.tdee} calories (TDEE - with activity factor)`,
      target: `${macroGoals.calories} calories (Daily Target - adjusted for goal)`,
    },
    calculation: {
      proteinMethod: "1.0g per lb of body weight",
      fatMethod: "22.5% of total calories",
      carbsMethod: "Remainder of calories",
    },
  };
}
