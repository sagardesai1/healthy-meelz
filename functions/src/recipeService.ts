import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import pdf from "pdf-parse";
import { defineString } from "firebase-functions/params";
import { VectorService } from "./vectorService";

// Define parameter for OpenAI API key
const openaiApiKey = defineString("OPENAI_API_KEY");

export interface IngredientData {
  ingredient: string;
  macroType: string;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  calories: number;
  commonSwaps: string[];
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  breakfastIngredients: string[];
  lunchIngredients: string[];
  dinnerIngredients: string[];
  macroGoals?: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  householdSizeBreakfast: number;
  householdSizeLunch: number;
  householdSizeDinner: number;
  mealPrepTime: string;
}

export class RecipeService {
  private openai: OpenAI | null = null;
  private ingredientData: IngredientData[] | null = null;
  private recipePDF: string | null = null;
  private vectorService: VectorService;

  constructor() {
    this.vectorService = new VectorService();
  }

  private getOpenAI() {
    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });
    }
    return this.openai;
  }

  /**
   * Load ingredient data from Food Swaps Database CSV
   */
  private async loadIngredientData(): Promise<IngredientData[]> {
    if (this.ingredientData) {
      return this.ingredientData;
    }

    try {
      // Path to your Food Swaps Database CSV file
      const csvPath = path.join(__dirname, "../data/food_swaps_database.csv");
      const csvContent = fs.readFileSync(csvPath, "utf-8");

      // Parse CSV
      const lines = csvContent.split("\n");
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));

      this.ingredientData = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => {
          const values = this.parseCSVLine(line);
          const ingredient: any = {};
          headers.forEach((header, index) => {
            let value: any = values[index] || "";

            // Parse commonSwaps from string array format
            if (header === "Common Swaps" && value) {
              try {
                // Handle different formats: "['item1', 'item2']" or "item1, item2"
                if (value.startsWith("[") && value.endsWith("]")) {
                  // Remove brackets and quotes, then split by comma
                  value = value
                    .replace(/[\[\]']/g, "")
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter((s: string) => s.length > 0);
                } else {
                  // Handle comma-separated values
                  value = value
                    .split(",")
                    .map((s: string) => s.trim().replace(/['"]/g, ""))
                    .filter((s: string) => s.length > 0);
                }
              } catch (error) {
                console.log(
                  "Error parsing commonSwaps:",
                  error,
                  "Value:",
                  value
                );
                value = [];
              }
            }

            // Convert numeric fields
            if (
              [
                "Protein (g)",
                "Carbs (g)",
                "Fat (g)",
                "Fiber (g)",
                "Calories",
              ].includes(header)
            ) {
              value = parseFloat(value) || 0;
            }

            // Map column names to interface properties
            const columnMapping: { [key: string]: string } = {
              Ingredient: "ingredient",
              "Macro Type": "macroType",
              "Protein (g)": "proteinG",
              "Carbs (g)": "carbsG",
              "Fat (g)": "fatG",
              "Fiber (g)": "fiberG",
              Calories: "calories",
              "Common Swaps": "commonSwaps",
            };

            const mappedHeader = columnMapping[header] || header.toLowerCase();
            ingredient[mappedHeader] = value;
          });
          return ingredient as IngredientData;
        });

      console.log(
        `Loaded ${this.ingredientData.length} ingredients from Food Swaps Database`
      );
      return this.ingredientData;
    } catch (error) {
      console.error("Error loading ingredient data:", error);
      throw new Error("Failed to load ingredient database");
    }
  }

  /**
   * Load recipe database from PDF file
   */
  private async loadRecipePDF(): Promise<string> {
    if (this.recipePDF !== null) {
      return this.recipePDF;
    }

    try {
      // Path to your recipe PDF file
      const pdfPath = path.join(__dirname, "../data/recipes.pdf");

      if (!fs.existsSync(pdfPath)) {
        console.log(
          "No recipes.pdf found, using ingredient-only meal planning"
        );
        this.recipePDF = "";
        return this.recipePDF;
      }

      const pdfBuffer = fs.readFileSync(pdfPath);

      // Check if the file is actually a PDF by looking at the first few bytes
      const header = pdfBuffer.toString("ascii", 0, 4);
      if (header !== "%PDF") {
        console.log(
          "recipes.pdf is not a valid PDF file, using ingredient-only meal planning"
        );
        this.recipePDF = "";
        return this.recipePDF;
      }

      const data = await pdf(pdfBuffer);

      this.recipePDF = data.text;
      console.log(
        `Loaded recipe database from PDF (${
          this.recipePDF?.length || 0
        } characters)`
      );

      return this.recipePDF;
    } catch (error) {
      console.log(
        "Error loading recipe PDF, using ingredient-only meal planning:",
        (error as Error).message
      );
      this.recipePDF = "";
      return this.recipePDF;
    }
  }

  /**
   * Simple CSV line parser (handles quoted fields)
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Generate meal plan using OpenAI with Food Swaps Database
   */
  async generateMealPlan(preferences: UserPreferences): Promise<string> {
    try {
      // Load ingredient data from Food Swaps Database
      const allIngredients = await this.loadIngredientData();

      // Search for relevant recipes using vector database
      const relevantRecipes = await this.searchRelevantRecipes(preferences);

      // Filter ingredients to reduce prompt size - focus on variety and swaps
      const userFavoriteIngredients = [
        ...preferences.breakfastIngredients,
        ...preferences.lunchIngredients,
        ...preferences.dinnerIngredients,
      ];

      const filteredIngredients = allIngredients.filter((ingredient) => {
        // Include some user's favorite ingredients (but not all)
        const isUserFavorite = userFavoriteIngredients.some(
          (fav) =>
            ingredient.ingredient.toLowerCase().includes(fav.toLowerCase()) ||
            fav.toLowerCase().includes(ingredient.ingredient.toLowerCase())
        );

        // Include common protein sources, vegetables, and grains for variety
        const commonIngredients = [
          "chicken",
          "beef",
          "fish",
          "salmon",
          "tuna",
          "turkey",
          "pork",
          "rice",
          "quinoa",
          "oats",
          "bread",
          "pasta",
          "potato",
          "sweet potato",
          "broccoli",
          "spinach",
          "lettuce",
          "tomato",
          "onion",
          "garlic",
          "egg",
          "milk",
          "cheese",
          "yogurt",
          "avocado",
          "banana",
          "apple",
        ];

        const isCommon = commonIngredients.some((common) =>
          ingredient.ingredient.toLowerCase().includes(common)
        );

        // Include some favorites but prioritize variety
        return isCommon || (isUserFavorite && Math.random() > 0.3); // Only include 70% of favorites
      });

      // If we still have too many ingredients, limit to top 100
      const limitedIngredients = filteredIngredients.slice(0, 100);

      // Format filtered ingredients for the prompt
      const ingredientDatabase =
        this.formatIngredientsForPrompt(limitedIngredients);

      // Create the prompt
      const prompt = this.createIngredientBasedMealPlanPrompt(
        preferences,
        ingredientDatabase,
        relevantRecipes
      );

      // Call OpenAI
      const completion = await this.getOpenAI().chat.completions.create({
        model: "gpt-4o", // Using GPT-4o which has 128k context limit
        messages: [
          {
            role: "system",
            content:
              "You are a personalized meal planning assistant specializing in ingredient-based meal creation and food swaps. Create detailed meal plans using available ingredients and suggest smart swaps based on nutritional profiles.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content ||
        "Failed to generate meal plan"
      );
    } catch (error) {
      console.error("Error generating meal plan:", error);
      throw new Error("Failed to generate meal plan");
    }
  }

  /**
   * Format ingredients for the prompt
   */
  private formatIngredientsForPrompt(ingredients: IngredientData[]): string {
    // Group ingredients by macro type for better organization
    const groupedIngredients = ingredients.reduce((acc, ingredient) => {
      if (!acc[ingredient.macroType]) {
        acc[ingredient.macroType] = [];
      }
      acc[ingredient.macroType].push(ingredient);
      return acc;
    }, {} as Record<string, IngredientData[]>);

    let result = "";
    for (const [macroType, ingredientsList] of Object.entries(
      groupedIngredients
    )) {
      result += `\n${macroType.toUpperCase()}S:\n`;
      result += ingredientsList
        .map(
          (ingredient) =>
            `${ingredient.ingredient}: ${ingredient.proteinG}g protein, ${
              ingredient.carbsG
            }g carbs, ${ingredient.fatG}g fat, ${ingredient.fiberG}g fiber, ${
              ingredient.calories
            } calories. Swaps: ${
              Array.isArray(ingredient.commonSwaps)
                ? ingredient.commonSwaps.join(", ")
                : "none"
            }`
        )
        .join("\n");
    }

    return result;
  }

  /**
   * Search for relevant recipes using vector database
   */
  private async searchRelevantRecipes(
    preferences: UserPreferences
  ): Promise<string> {
    try {
      // Create search queries based on user preferences
      const searchQueries = [
        `breakfast recipes with ${preferences.breakfastIngredients
          .slice(0, 3)
          .join(" and ")}`,
        `lunch recipes with ${preferences.lunchIngredients
          .slice(0, 3)
          .join(" and ")}`,
        `dinner recipes with ${preferences.dinnerIngredients
          .slice(0, 3)
          .join(" and ")}`,
        `healthy recipes for general nutrition`,
      ];

      const allResults = [];

      for (const query of searchQueries) {
        const results = await this.vectorService.searchRecipes(
          query,
          {
            dietaryRestrictions: preferences.dietaryRestrictions,
          },
          5 // Get top 5 results per query
        );
        allResults.push(...results);
      }

      // Remove duplicates and format results
      const uniqueResults = allResults.filter(
        (result, index, self) =>
          index === self.findIndex((r) => r.id === result.id)
      );

      // Format recipe results for the prompt
      const recipeDatabase = uniqueResults
        .slice(0, 20) // Limit to top 20 recipes
        .map((result) => {
          const metadata = result.metadata;
          return `
Recipe: ${metadata.recipeName || "Unnamed Recipe"}
Meal Type: ${metadata.mealType || "general"}
Ingredients: ${metadata.ingredients?.join(", ") || "Not specified"}
Dietary Info: ${metadata.dietaryInfo?.join(", ") || "None"}
Prep Time: ${metadata.prepTime || "Not specified"}
Serving Size: ${metadata.servingSize || "Not specified"}
          `.trim();
        })
        .join("\n\n");

      console.log(
        `Found ${uniqueResults.length} relevant recipes for meal planning`
      );
      return recipeDatabase;
    } catch (error) {
      console.error("Error searching relevant recipes:", error);
      return "No recipe database available - using ingredient-only meal planning";
    }
  }

  /**
   * Create the prompt for ingredient-based meal planning
   */
  private createIngredientBasedMealPlanPrompt(
    preferences: UserPreferences,
    ingredientDatabase: string,
    recipeDatabase: string
  ): string {
    const macroInfo = preferences.macroGoals
      ? `Daily nutrition goals: ${preferences.macroGoals.calories} calories, ${preferences.macroGoals.proteinGrams}g protein, ${preferences.macroGoals.carbsGrams}g carbs, ${preferences.macroGoals.fatGrams}g fat`
      : "No specific macro goals provided";

    const recipeSection = recipeDatabase
      ? `\n\nRELEVANT RECIPE DATABASE:
${recipeDatabase}`
      : "";

    return `
You are a nutrition-focused meal planning assistant that creates personalized daily meal suggestions based on user data. Your goal is to generate one breakfast, one lunch, and one dinner that align with the user's preferences, goals, and restrictions while maintaining a positive, non-restrictive approach to food.

## Core Principles
- **Nourishment-focused**: Emphasize how foods support energy, strength, and wellbeing
- **Build on favorites**: Use the user's favorite ingredients as inspiration
- **Practical portions**: Consider household size and meal prep constraints
- **Goal-supportive**: Align macro distribution with their specific goals without obsessing over exact numbers
- **Allergen-safe**: Strictly avoid all listed dietary restrictions and allergens
- **Smart swapping**: Use the Food Swaps Database to suggest creative alternatives

## User Profile
**Demographics & Goals:**
- Household Size: ${preferences.householdSizeBreakfast} people for breakfast, ${
      preferences.householdSizeLunch
    } people for lunch, ${preferences.householdSizeDinner} people for dinner
- Meal Prep Time: ${preferences.mealPrepTime}
- ${macroInfo}

**Dietary Restrictions:** ${
      preferences.dietaryRestrictions.join(", ") || "None"
    }

**Favorite Ingredients:**
- Breakfast: ${preferences.breakfastIngredients.join(", ")}
- Lunch: ${preferences.lunchIngredients.join(", ")}
- Dinner: ${preferences.dinnerIngredients.join(", ")}

## Available Ingredients Database
${ingredientDatabase}
${recipeSection}

## Meal Generation Algorithm

### Step 1: Analyze User Profile
- Identify dietary constraints (strict - never violate these)
- Note macro goals for meal distribution
- Assess household size and prep time constraints
- **IMPORTANT**: User's favorite ingredients are just preferences, NOT requirements

### Step 2: Create Diverse Meal Framework
Create breakfast, lunch, and dinner with VARIETY and SMART SWAPS:

**Base Structure:**
- **Foundation**: Select carb base from available ingredients (mix of grains, vegetables, etc.)
- **Protein**: Choose from diverse protein sources, prioritize swaps over favorites
- **Vegetables**: Include 1-2 vegetables (mix familiar and new options)
- **Healthy fats**: Incorporate sources from the database
- **Flavor enhancers**: Use herbs, spices, and seasonings

### Step 3: Smart Swapping Strategy (CRITICAL)
**Your primary goal is to introduce variety and swaps, NOT repeat their favorites:**

- **Use favorite ingredients sparingly**: Only include 1-2 favorite ingredients per day, not every meal
- **Prioritize swaps**: For each meal, suggest 2-3 ingredient swaps from the Common Swaps column
- **Introduce new ingredients**: Include ingredients they haven't listed as favorites
- **For Muscle Gain Goals**: Focus on protein-rich swaps and new protein sources
- **For Weight Loss Goals**: Emphasize volume with new vegetables and lower-calorie swaps
- **For Maintenance Goals**: Introduce nutritional variety and new preparation methods

### Step 4: Practical Considerations
- Prep time: Respect their stated time constraints
- Household size: Scale recipes appropriately
- Ingredient availability: Use items from the Food Swaps Database
- Smart swaps: Suggest alternatives from the Common Swaps column

## Output Format
Generate a single day meal plan using this structure:

**BREAKFAST** (serves ${preferences.householdSizeBreakfast})
**[Meal Name]** - *featuring smart swaps and variety*

Ingredients for ${preferences.householdSizeBreakfast} serving${
      preferences.householdSizeBreakfast > 1 ? "s" : ""
    }:
- [primary ingredient] ([amount from Food Swaps Database])
- [swapped ingredient] ([amount]) - *swap for [original ingredient]*
- [new ingredient] ([amount]) - *introducing variety*
[...]

Why this works for you:
- Supports your goals with [specific nutritional benefit]
- **Smart swaps**: [alternative ingredient] instead of [common choice] for [benefit]
- **New variety**: [new ingredient] adds [nutritional benefit]
- **Balanced approach**: Mixes familiar flavors with new options

Instructions:
Meal prep the following:
1. [Detailed meal prep step 1 with timing]
2. [Detailed meal prep step 2 with timing]
3. [Storage and preparation instructions]

The night before (or morning of):
1. [Last-minute prep step 1 with timing]
2. [Last-minute prep step 2 with timing]
3. [Assembly instructions for meal prep container]
4. [Final serving instructions]

**LUNCH** (serves ${preferences.householdSizeLunch})
[Same format]

**DINNER** (serves ${preferences.householdSizeDinner})
[Same format]

[Repeat for all 7 days]

## Critical Instructions for Variety and Swaps

### Variety Requirements (MANDATORY)
- **Limit favorite ingredients**: Use only 1-2 favorite ingredients per day, maximum
- **Prioritize swaps**: Each meal must include 2-3 ingredient swaps from the Common Swaps column
- **Introduce new ingredients**: Include at least 1-2 ingredients they haven't listed as favorites
- **Avoid repetition**: Don't suggest the same ingredients they already eat regularly

### Smart Swapping Strategy
- **Always explain swaps**: For each swap, explain why it's better (nutrition, variety, etc.)
- **Use Common Swaps column**: Reference the "Common Swaps" field for each ingredient
- **Mix familiar and new**: Balance comfort with exploration
- **Focus on benefits**: Highlight nutritional advantages of swaps

### Detailed Prep Instructions (CRITICAL)
- **Meal prep timing**: Include specific timing for each prep step (e.g., "10-12 minutes", "the night before")
- **Storage instructions**: Explain how to store prepared components
- **Assembly guidance**: Provide step-by-step container assembly instructions
- **Serving timing**: Include "morning of" or "night before" timing for different components
- **Practical details**: Include specific techniques like "ice bath", "microwave according to package", "wrap in foil"

### Dietary Restriction Handling
- **Strict compliance**: Never suggest foods that violate stated restrictions
- **Safe alternatives**: Always provide suitable swaps from the Food Swaps Database
- **Contradiction resolution**: If restrictions conflict with favorite ingredients, suggest clarification

### Goal Alignment
- **Muscle Gain**: Emphasize protein-rich swaps and new protein sources
- **Weight Loss**: Focus on volume with new vegetables and lower-calorie swaps
- **Maintenance**: Introduce nutritional variety and new preparation methods

### Quality Checks
- All suggested meals must be allergen-free
- Use ingredients from the Food Swaps Database
- Macro distribution should align with their targets
- Preparation time must fit their preferences
- **MUST include smart swaps for variety and nutrition optimization**

### Tone and Language
- **Encouraging**: "This supports your goals" not calorie-focused language
- **Practical**: Focus on how meals fit their lifestyle
- **Positive**: Emphasize what foods DO for them
- **Educational**: Explain why swaps are beneficial

**Remember: Your primary goal is to introduce variety and swaps, NOT to repeat their favorite ingredients. Create meals that expand their culinary horizons while supporting their health goals.**

## Example of Detailed Prep Instructions:

BREAKFAST BENTO BOX
~10 minutes to prep
Ingredients for four servings:
8 hard-boiled eggs
4 slices sourdough bread
4 tbsp almond butter
1 box Amylu Breakfast Meatballs
Ingredients for four servings:
2 hard-boiled eggs
1 slices sourdough bread
1 tbsp almond butter
3 Amylu Breakfast Meatballs
Instructions:
Meal prep the following:
1.Place 8 eggs in a pot, cover with water, and bring to a boil.
2.Once boiling, cover, remove from heat, and let sit for 10–12 minutes.
3.Drain and transfer to an ice bath. Once cool, peel and store in the fridge.
The night before (or morning of):
1.Lightly toast slice of bread. Spread nut butter on. Wrap in foil to keep from getting
soggy.
2.Microwave your meatballs according to package instructions.
3.In your meal prep container, pack the following: peeled hard-boiled eggs, sourdough
bread w/ almond butter and meatballs. Enjoy!

**Follow this detailed format for all meals with specific timing, storage instructions, and practical assembly guidance.**
    `;
  }

  /**
   * Get meal suggestions for a specific meal type using Food Swaps Database
   */
  async getMealSuggestions(
    mealType: "breakfast" | "lunch" | "dinner",
    preferences: UserPreferences
  ): Promise<string> {
    try {
      // Load ingredient data from Food Swaps Database
      const allIngredients = await this.loadIngredientData();

      // Load recipe database from PDF
      const recipePDF = await this.loadRecipePDF();

      // Format all ingredients for the prompt (let LLM decide what to use)
      const ingredientDatabase =
        this.formatIngredientsForPrompt(allIngredients);

      const prompt = `
You are a nutrition-focused meal planning assistant creating ${mealType} suggestions. Your goal is to generate nourishing meals that align with the user's preferences, goals, and restrictions while maintaining a positive, non-restrictive approach to food.

## User Profile
**Household & Time:**
- Household size: ${
        mealType === "breakfast"
          ? preferences.householdSizeBreakfast
          : mealType === "lunch"
          ? preferences.householdSizeLunch
          : preferences.householdSizeDinner
      } people for ${mealType}
- Meal prep time: ${preferences.mealPrepTime}

**Dietary Restrictions:** ${
        preferences.dietaryRestrictions.join(", ") || "None"
      }

**Favorite ${mealType} Ingredients:** ${preferences[
        `${mealType}Ingredients`
      ].join(", ")}

**Macro Goals:** ${
        preferences.macroGoals
          ? `${preferences.macroGoals.calories} calories, ${preferences.macroGoals.proteinGrams}g protein, ${preferences.macroGoals.carbsGrams}g carbs, ${preferences.macroGoals.fatGrams}g fat`
          : "No specific macro goals provided"
      }

## Available Ingredients Database
${ingredientDatabase}
${
  recipePDF
    ? `\n\nRECIPE DATABASE (PDF):
${recipePDF}`
    : ""
}

## Instructions
Create 3-5 ${mealType} meal suggestions using this approach:

### Core Principles
- **Nourishment-focused**: Emphasize how foods support energy, strength, and wellbeing
- **Build on favorites**: Use the user's favorite ${mealType} ingredients as inspiration
- **Smart swapping**: Use the Food Swaps Database to suggest creative alternatives
- **Allergen-safe**: Strictly avoid all listed dietary restrictions
- **Practical**: Respect prep time and household size constraints

### Output Format
For each meal suggestion, provide:

**SUGGESTION 1: [Meal Name]**
*Inspired by your favorite [ingredient from their preferences]*

**Ingredients:**
- [ingredient] ([amount]) - *from Food Swaps Database*
- [ingredient] ([amount])
[...]

**Why this works for you:**
- Supports your goals with [specific nutritional benefit]
- Uses [favorite ingredient] from your preferences
- Includes smart swaps: [alternative ingredient] for variety
- [Any other personalized benefit]

**Prep notes:** [Quick preparation tips, timing, make-ahead options]

**Smart swaps to try:**
- [suggestion from Common Swaps column]
- [another swap option]

[Repeat for all 3-5 suggestions]

## Important Guidelines
- Use ingredients from the Food Swaps Database
- Prioritize their favorite ${mealType} ingredients
- Suggest swaps from the Common Swaps column for variety
- Ensure all meals are allergen-free
- Keep prep time within their stated preferences
- Scale portions for ${
        mealType === "breakfast"
          ? preferences.householdSizeBreakfast
          : mealType === "lunch"
          ? preferences.householdSizeLunch
          : preferences.householdSizeDinner
      } people
- Maintain encouraging, positive tone focused on nourishment
      `;

      const completion = await this.getOpenAI().chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful meal planning assistant specializing in ${mealType} recommendations using ingredient-based meal creation and smart food swaps.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      });

      return (
        completion.choices[0]?.message?.content ||
        "Failed to generate suggestions"
      );
    } catch (error) {
      console.error("Error generating meal suggestions:", error);
      throw new Error("Failed to generate meal suggestions");
    }
  }
}
