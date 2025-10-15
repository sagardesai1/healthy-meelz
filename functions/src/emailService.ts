import Mailgun from "mailgun.js";
import FormData from "form-data";
import { defineString } from "firebase-functions/params";

// Define parameters for Mailgun configuration
const mailgunApiKey = defineString("MAILGUN_API_KEY");
const mailgunDomain = defineString("MAILGUN_DOMAIN");
const mailgunFromEmail = defineString("MAILGUN_FROM_EMAIL");

// Mailgun client will be initialized lazily

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface UserData {
  name: string;
  phoneNumber: string;
  goals: string[];
  planningDay: string;
  mealPrepTime: string;
  householdSize: number;
  mealsPrepared: string[];
  mealPeopleCounts: Record<string, number>;
  dietaryRestrictions: string[];
  breakfastIngredients: string[];
  lunchIngredients: string[];
  dinnerIngredients: string[];
  age: number;
  gender: string;
  weight: number;
  activityLevel: string;
  goal: string;
  email: string;
  macroGoals?: {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
}

export class EmailService {
  private mg: any;

  constructor() {
    // Using Mailgun's default configuration
  }

  private getMailgunClient() {
    if (!this.mg) {
      const mailgun = new Mailgun(FormData);
      this.mg = mailgun.client({
        username: "api",
        key: mailgunApiKey.value(),
        url: "https://api.mailgun.net",
      });
    }
    return this.mg;
  }

  /**
   * Send meal planning reminder email
   */
  async sendMealPlanningReminder(
    email: string,
    userData: UserData,
    mealPlan?: string
  ): Promise<boolean> {
    try {
      const template = this.generateMealPlanningTemplate(userData, mealPlan);

      const domain = mailgunDomain.value();
      const fromEmail = mailgunFromEmail.value();

      const messageData = {
        from: `Healthy Meelz <${fromEmail}>`,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      const response = await this.getMailgunClient().messages.create(
        domain,
        messageData
      );
      console.log("Email sent successfully:", response.id);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  /**
   * Send welcome email after onboarding
   */
  async sendWelcomeEmail(email: string, userData: UserData): Promise<boolean> {
    try {
      const template = this.generateWelcomeTemplate(userData);

      const domain = mailgunDomain.value();
      const fromEmail = mailgunFromEmail.value();

      const messageData = {
        from: `Healthy Meelz <${fromEmail}>`,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      const response = await this.getMailgunClient().messages.create(
        domain,
        messageData
      );
      console.log("Welcome email sent successfully:", response.id);
      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  }

  /**
   * Generate meal planning reminder template
   */
  private generateMealPlanningTemplate(
    userData: UserData,
    mealPlan?: string
  ): EmailTemplate {
    const planningDay = this.formatPlanningDay(userData.planningDay);
    const meals = this.formatMeals(userData.mealsPrepared);
    const dietaryInfo =
      userData.dietaryRestrictions.length > 0
        ? `Remember your dietary preferences: ${userData.dietaryRestrictions.join(
            ", "
          )}`
        : "";

    const subject = `🍽️ Time for your ${planningDay} meal planning!`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meal Planning Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Meal Planning Time!</h1>
            <p>Let's make this ${planningDay} delicious and nourishing</p>
          </div>
          <div class="content">
            <h2>Hi ${userData.name || "there"}!</h2>
            <p>It's time for your weekly meal planning session. Here's what we know about your preferences:</p>
            
            <div class="highlight">
              <h3>📋 Your Planning Preferences</h3>
              <ul>
                <li><strong>Planning Day:</strong> ${planningDay}</li>
                <li><strong>Meals to Plan:</strong> ${meals}</li>
                <li><strong>Household Size:</strong> ${
                  userData.mealPeopleCounts?.breakfast || userData.householdSize
                } people for breakfast, ${
      userData.mealPeopleCounts?.lunch || userData.householdSize
    } people for lunch, ${
      userData.mealPeopleCounts?.dinner || userData.householdSize
    } people for dinner</li>
                <li><strong>Prep Time:</strong> ${userData.mealPrepTime}</li>
              </ul>
            </div>

            ${
              userData.macroGoals
                ? `
            <div class="highlight">
              <h3>🎯 Your Daily Nutrition Goals</h3>
              <ul>
                <li><strong>Calories:</strong> ${userData.macroGoals.calories}</li>
                <li><strong>Protein:</strong> ${userData.macroGoals.proteinGrams}g</li>
                <li><strong>Carbs:</strong> ${userData.macroGoals.carbsGrams}g</li>
                <li><strong>Fat:</strong> ${userData.macroGoals.fatGrams}g</li>
              </ul>
            </div>
            `
                : ""
            }

            ${
              dietaryInfo
                ? `<p><strong>💡 Tip:</strong> ${dietaryInfo}</p>`
                : ""
            }

            <h3>🌟 Your Go-to Ingredients</h3>
            <p>Here are some ingredients you love to use:</p>
            <ul>
              ${
                userData.breakfastIngredients.length > 0
                  ? `<li><strong>Breakfast:</strong> ${userData.breakfastIngredients
                      .slice(0, 5)
                      .join(", ")}</li>`
                  : ""
              }
              ${
                userData.lunchIngredients.length > 0
                  ? `<li><strong>Lunch:</strong> ${userData.lunchIngredients
                      .slice(0, 5)
                      .join(", ")}</li>`
                  : ""
              }
              ${
                userData.dinnerIngredients.length > 0
                  ? `<li><strong>Dinner:</strong> ${userData.dinnerIngredients
                      .slice(0, 5)
                      .join(", ")}</li>`
                  : ""
              }
            </ul>

            ${
              mealPlan
                ? `
            <h3>🍽️ Your Personalized Meal Plan</h3>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; white-space: pre-line; font-family: monospace; font-size: 14px; line-height: 1.6;">
              ${mealPlan}
            </div>
            `
                : `
            <p>Ready to plan some amazing meals? Let's make this week nourishing and delicious! 🌱</p>
            
            <div style="text-align: center;">
              <a href="#" class="button">Start Planning</a>
            </div>
            `
            }
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      🍽️ Time for your ${planningDay} meal planning!
      
      Hi ${userData.name || "there"}!
      
      It's time for your weekly meal planning session. Here's what we know about your preferences:
      
      📋 Your Planning Preferences:
      - Planning Day: ${planningDay}
      - Meals to Plan: ${meals}
      - Household Size: ${userData.householdSize} ${
      userData.householdSize === 1 ? "person" : "people"
    }
      - Prep Time: ${userData.mealPrepTime}
      
      ${
        userData.macroGoals
          ? `
      🎯 Your Daily Nutrition Goals:
      - Calories: ${userData.macroGoals.calories}
      - Protein: ${userData.macroGoals.proteinGrams}g
      - Carbs: ${userData.macroGoals.carbsGrams}g
      - Fat: ${userData.macroGoals.fatGrams}g
      `
          : ""
      }
      
      ${dietaryInfo ? `💡 Tip: ${dietaryInfo}` : ""}
      
      🌟 Your Go-to Ingredients:
      ${
        userData.breakfastIngredients.length > 0
          ? `- Breakfast: ${userData.breakfastIngredients
              .slice(0, 5)
              .join(", ")}`
          : ""
      }
      ${
        userData.lunchIngredients.length > 0
          ? `- Lunch: ${userData.lunchIngredients.slice(0, 5).join(", ")}`
          : ""
      }
      ${
        userData.dinnerIngredients.length > 0
          ? `- Dinner: ${userData.dinnerIngredients.slice(0, 5).join(", ")}`
          : ""
      }
      
      ${
        mealPlan
          ? `
      🍽️ Your Personalized Meal Plan:
      
      ${mealPlan}
      
      ---
      `
          : `
      Ready to plan some amazing meals? Let's make this week nourishing and delicious! 🌱
      
      ---
      `
      }
      This email was sent because you signed up for meal planning reminders from Healthy Meelz.
      If you'd like to change your preferences, you can update them in your account settings.
    `;

    return { subject, html, text };
  }

  /**
   * Generate welcome email template
   */
  private generateWelcomeTemplate(userData: UserData): EmailTemplate {
    const subject = "🎉 Welcome to Healthy Meelz - Your journey starts now!";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Healthy Meelz</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Healthy Meelz!</h1>
            <p>Your personalized nutrition journey starts now</p>
          </div>
          <div class="content">
            <h2>Hi ${userData.name || "there"}!</h2>
            <p>Welcome to Healthy Meelz! We're thrilled you've joined our community of people committed to nourishing themselves with intention and joy.</p>
            
            <div class="highlight">
              <h3>✨ What happens next?</h3>
              <ul>
                <li>📅 You'll receive meal planning reminders every ${this.formatPlanningDay(
                  userData.planningDay
                )}</li>
                <li>🍽️ Personalized meal suggestions based on your preferences</li>
                <li>📱 Grocery lists tailored to your household size</li>
                <li>🌱 Ongoing support for your nutrition journey</li>
              </ul>
            </div>

            <p>We've already set up your personalized profile based on your preferences. Your first meal planning reminder will arrive next ${this.formatPlanningDay(
              userData.planningDay
            )}!</p>

            <div style="text-align: center;">
              <a href="#" class="button">Get Started</a>
            </div>

            <p>Remember, this is about progress, not perfection. Every small step toward nourishing yourself matters.</p>
            
            <p>With love and encouragement,<br>
            The Healthy Meelz Team 🌱</p>
          </div>
          <div class="footer">
            <p>Questions? Just reply to this email - we'd love to hear from you!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      🎉 Welcome to Healthy Meelz - Your journey starts now!
      
      Hi ${userData.name || "there"}!
      
      Welcome to Healthy Meelz! We're thrilled you've joined our community of people committed to nourishing themselves with intention and joy.
      
      ✨ What happens next?
      - 📅 You'll receive meal planning reminders every ${this.formatPlanningDay(
        userData.planningDay
      )}
      - 🍽️ Personalized meal suggestions based on your preferences
      - 📱 Grocery lists tailored to your household size
      - 🌱 Ongoing support for your nutrition journey
      
      We've already set up your personalized profile based on your preferences. Your first meal planning reminder will arrive next ${this.formatPlanningDay(
        userData.planningDay
      )}!
      
      Remember, this is about progress, not perfection. Every small step toward nourishing yourself matters.
      
      With love and encouragement,
      The Healthy Meelz Team 🌱
      
      ---
      Questions? Just reply to this email - we'd love to hear from you!
    `;

    return { subject, html, text };
  }

  /**
   * Format planning day for display
   */
  private formatPlanningDay(day: string): string {
    const dayMap: { [key: string]: string } = {
      sunday: "Sunday",
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      flexible: "when it works for you",
    };
    return dayMap[day] || day;
  }

  /**
   * Format meals list for display
   */
  private formatMeals(meals: string[]): string {
    const mealMap: { [key: string]: string } = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snacks: "Snacks",
    };
    return meals.map((meal) => mealMap[meal] || meal).join(", ");
  }
}
