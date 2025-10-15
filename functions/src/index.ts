import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { EmailService, UserData } from "./emailService";
import { RecipeService, UserPreferences } from "./recipeService";
import { VectorService } from "./vectorService";

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

const emailService = new EmailService();
const recipeService = new RecipeService();
const vectorService = new VectorService();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Scheduled function to send meal planning reminders
export const sendMealPlanningReminders = onSchedule(
  {
    schedule: "08 00 * * *", // Every day at 8:00 AM ET
    timeZone: "America/New_York",
  },
  async (event) => {
    logger.info("🍽️ Starting daily meal planning reminder job", {
      structuredData: true,
    });

    try {
      // Get current day of week (e.g., "monday", "tuesday", etc.)
      const today = new Date()
        .toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: "America/New_York",
        })
        .toLowerCase();

      logger.info(`Today is: ${today}`);

      // Query users who want reminders today
      const usersSnapshot = await db
        .collection("users")
        .where("planningDay", "==", today)
        .get();

      logger.info(
        `Found ${usersSnapshot.size} users who want reminders on ${today}`
      );

      if (usersSnapshot.size === 0) {
        logger.info("No users to send reminders to today");
        return;
      }

      // Process each user
      const results = [];
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        const userId = doc.id;

        logger.info(`Processing user: ${userId}`);

        // Check if user has email
        if (!userData.email) {
          logger.warn(`User ${userId} has no email address - skipping`);
          results.push({ userId, status: "skipped", reason: "no email" });
          continue;
        }

        try {
          // Generate meal plan first
          logger.info(`Generating meal plan for user: ${userId}`);

          // Convert to UserPreferences format
          const preferences: UserPreferences = {
            dietaryRestrictions: userData.dietaryRestrictions || [],
            breakfastIngredients: userData.breakfastIngredients || [],
            lunchIngredients: userData.lunchIngredients || [],
            dinnerIngredients: userData.dinnerIngredients || [],
            macroGoals: userData.macroGoals,
            householdSizeBreakfast:
              userData.mealPeopleCounts?.breakfast ||
              userData.householdSize ||
              1,
            householdSizeLunch:
              userData.mealPeopleCounts?.lunch || userData.householdSize || 1,
            householdSizeDinner:
              userData.mealPeopleCounts?.dinner || userData.householdSize || 1,
            mealPrepTime: userData.mealPrepTime,
          };

          // Generate meal plan using RecipeService
          const mealPlan = await recipeService.generateMealPlan(preferences);

          // Save meal plan to user's document
          await doc.ref.update({
            lastMealPlanGenerated: new Date(),
            lastMealPlan: mealPlan,
          });

          // Send the reminder email with the generated meal plan
          const success = await emailService.sendMealPlanningReminder(
            userData.email,
            userData as UserData,
            mealPlan
          );

          if (success) {
            logger.info(`✅ Sent reminder to ${userData.email}`);

            // Update last reminder sent timestamp
            await doc.ref.update({
              lastReminderSent: new Date(),
            });

            results.push({ userId, status: "sent", email: userData.email });
          } else {
            logger.error(`❌ Failed to send reminder to ${userData.email}`);
            results.push({ userId, status: "failed", email: userData.email });
          }
        } catch (error) {
          logger.error(`Error sending reminder to ${userData.email}:`, error);
          results.push({
            userId,
            status: "error",
            email: userData.email,
            error: (error as Error).message,
          });
        }
      }

      // Log summary
      const sent = results.filter((r) => r.status === "sent").length;
      const failed = results.filter((r) => r.status === "failed").length;
      const skipped = results.filter((r) => r.status === "skipped").length;

      logger.info(
        `📊 Reminder job completed: ${sent} sent, ${failed} failed, ${skipped} skipped`
      );
    } catch (error) {
      logger.error("❌ Error in meal planning reminder job:", error);
    }
  }
);

// Function to send welcome email after onboarding
export const sendWelcomeEmail = onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { userId, email } = request.body;

    if (!userId || !email) {
      response.status(400).json({ error: "userId and email are required" });
      return;
    }

    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      response.status(404).json({ error: "User not found" });
      return;
    }

    const userData = userDoc.data() as UserData;

    // Send welcome email
    const success = await emailService.sendWelcomeEmail(email, userData);

    if (success) {
      // Update user with email and welcome email sent flag
      await userDoc.ref.update({
        email: email,
        welcomeEmailSent: true,
        welcomeEmailSentAt: new Date(),
      });

      response.json({ success: true, message: "Welcome email sent" });
    } else {
      response.status(500).json({ error: "Failed to send welcome email" });
    }
  } catch (error) {
    logger.error("Error sending welcome email:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

// Function to update user email preferences
export const updateEmailPreferences = onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { userId, email, planningDay } = request.body;

    if (!userId) {
      response.status(400).json({ error: "userId is required" });
      return;
    }

    const updateData: any = {
      emailPreferencesUpdatedAt: new Date(),
    };

    if (email !== undefined) updateData.email = email;
    if (planningDay !== undefined) updateData.planningDay = planningDay;

    await db.collection("users").doc(userId).update(updateData);

    response.json({ success: true, message: "Email preferences updated" });
  } catch (error) {
    logger.error("Error updating email preferences:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

// Health check function
export const healthCheck = onRequest((request, response) => {
  response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Healthy Meelz Email Service",
  });
});

// Manual trigger function for testing
export const testMealPlanningReminders = onRequest(
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      logger.info("🧪 Manual test trigger for meal planning reminders");

      // Get current day of week
      const today = new Date()
        .toLocaleDateString("en-US", {
          weekday: "long",
          timeZone: "America/New_York",
        })
        .toLowerCase();

      logger.info(`Test run for: ${today}`);

      // Query users who want reminders today
      const usersSnapshot = await db
        .collection("users")
        .where("planningDay", "==", today)
        .get();

      logger.info(`Found ${usersSnapshot.size} users for test`);

      const results = [];
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        const userId = doc.id;

        if (!userData.email) {
          results.push({ userId, status: "skipped", reason: "no email" });
          continue;
        }

        try {
          const success = await emailService.sendMealPlanningReminder(
            userData.email,
            userData as UserData
          );

          results.push({
            userId,
            status: success ? "sent" : "failed",
            email: userData.email,
          });
        } catch (error) {
          results.push({
            userId,
            status: "error",
            email: userData.email,
            error: (error as Error).message,
          });
        }
      }

      response.json({
        success: true,
        message: "Test completed",
        today: today,
        results: results,
        summary: {
          total: results.length,
          sent: results.filter((r) => r.status === "sent").length,
          failed: results.filter((r) => r.status === "failed").length,
          skipped: results.filter((r) => r.status === "skipped").length,
        },
      });
    } catch (error) {
      logger.error("Error in test function:", error);
      response.status(500).json({ error: "Internal server error" });
    }
  }
);

// Generate meal plan using OpenAI + recipe database
export const generateMealPlan = onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { userId } = request.body;

    if (!userId) {
      response.status(400).json({ error: "userId is required" });
      return;
    }

    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      response.status(404).json({ error: "User not found" });
      return;
    }

    const userData = userDoc.data() as UserData;

    // Convert to UserPreferences format
    const preferences: UserPreferences = {
      dietaryRestrictions: userData.dietaryRestrictions || [],
      breakfastIngredients: userData.breakfastIngredients || [],
      lunchIngredients: userData.lunchIngredients || [],
      dinnerIngredients: userData.dinnerIngredients || [],
      macroGoals: userData.macroGoals,
      householdSizeBreakfast:
        userData.mealPeopleCounts?.breakfast || userData.householdSize || 1,
      householdSizeLunch:
        userData.mealPeopleCounts?.lunch || userData.householdSize || 1,
      householdSizeDinner:
        userData.mealPeopleCounts?.dinner || userData.householdSize || 1,
      mealPrepTime: userData.mealPrepTime,
    };

    logger.info(`Generating meal plan for user: ${userId}`);

    // Generate meal plan
    const mealPlan = await recipeService.generateMealPlan(preferences);

    // Save meal plan to user's document
    await userDoc.ref.update({
      lastMealPlanGenerated: new Date(),
      lastMealPlan: mealPlan,
    });

    response.json({
      success: true,
      mealPlan: mealPlan,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error generating meal plan:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

// Search recipes using vector database
export const searchRecipes = onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { query, filters, topK } = request.body;

    if (!query) {
      response.status(400).json({ error: "query is required" });
      return;
    }

    logger.info(`Searching recipes with query: ${query}`);

    // Search for relevant recipes
    const results = await vectorService.searchRecipes(
      query,
      filters,
      topK || 10
    );

    response.json({
      success: true,
      results: results,
      query: query,
      count: results.length,
    });
  } catch (error) {
    logger.error("Error searching recipes:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

// Get meal suggestions for a specific meal type
export const getMealSuggestions = onRequest(async (request, response) => {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { userId, mealType } = request.body;

    if (!userId || !mealType) {
      response.status(400).json({ error: "userId and mealType are required" });
      return;
    }

    if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
      response
        .status(400)
        .json({ error: "mealType must be breakfast, lunch, or dinner" });
      return;
    }

    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      response.status(404).json({ error: "User not found" });
      return;
    }

    const userData = userDoc.data() as UserData;

    // Convert to UserPreferences format
    const preferences: UserPreferences = {
      dietaryRestrictions: userData.dietaryRestrictions || [],
      breakfastIngredients: userData.breakfastIngredients || [],
      lunchIngredients: userData.lunchIngredients || [],
      dinnerIngredients: userData.dinnerIngredients || [],
      macroGoals: userData.macroGoals,
      householdSizeBreakfast:
        userData.mealPeopleCounts?.breakfast || userData.householdSize || 1,
      householdSizeLunch:
        userData.mealPeopleCounts?.lunch || userData.householdSize || 1,
      householdSizeDinner:
        userData.mealPeopleCounts?.dinner || userData.householdSize || 1,
      mealPrepTime: userData.mealPrepTime,
    };

    logger.info(`Getting ${mealType} suggestions for user: ${userId}`);

    // Get meal suggestions
    const suggestions = await recipeService.getMealSuggestions(
      mealType as "breakfast" | "lunch" | "dinner",
      preferences
    );

    response.json({
      success: true,
      mealType: mealType,
      suggestions: suggestions,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error getting meal suggestions:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});
