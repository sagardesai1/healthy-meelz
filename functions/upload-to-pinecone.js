#!/usr/bin/env node

/**
 * Local script to upload recipe PDF to Pinecone vector database
 * Run this script locally to initialize your vector database
 *
 * Usage:
 *   1. Create a .env file in the functions directory with your API keys
 *   2. Run: node upload-to-pinecone.js
 */

// Load environment variables from .env file
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Pinecone } = require("@pinecone-database/pinecone");
const pdf = require("pdf-parse");
const OpenAI = require("openai");

// Configuration - Load from environment variables
// Create a .env file in the functions directory with your API keys
const CONFIG = {
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX_NAME:
    process.env.PINECONE_INDEX_NAME || "healthy-meelz-recipes",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PDF_PATH: "./data/recipes.pdf", // Path to your recipe PDF
};

// Validate required environment variables
if (!CONFIG.PINECONE_API_KEY) {
  console.error("❌ Error: PINECONE_API_KEY environment variable is required");
  console.log("Please set it in your .env file or export it in your shell");
  process.exit(1);
}

if (!CONFIG.OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY environment variable is required");
  console.log("Please set it in your .env file or export it in your shell");
  process.exit(1);
}

// Initialize clients
const pinecone = new Pinecone({
  apiKey: CONFIG.PINECONE_API_KEY,
});

const openai = new OpenAI({
  apiKey: CONFIG.OPENAI_API_KEY,
});

/**
 * Chunk PDF into recipe-sized pieces
 */
async function chunkPDF(pdfPath) {
  try {
    console.log(`📄 Loading PDF: ${pdfPath}`);

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(pdfBuffer);

    const chunks = [];
    const text = data.text;

    console.log(`📄 PDF loaded: ${text.length} characters`);

    // Split by recipe patterns (adjust based on your PDF format)
    const recipePatterns = [
      /\n\s*Recipe\s*:\s*(.+?)(?=\n\s*Recipe\s*:|$)/gi,
      /\n\s*\d+\.\s*(.+?)(?=\n\s*\d+\.\s*|$)/gi,
      /\n\s*[A-Z][A-Z\s]+(?=\n\s*Ingredients:|$)/gi,
    ];

    let recipeTexts = [];

    // Try different patterns to extract recipes
    for (const pattern of recipePatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        recipeTexts = matches;
        console.log(
          `📄 Found ${matches.length} recipes using pattern: ${pattern}`
        );
        break;
      }
    }

    // If no recipes found with patterns, split by pages
    if (recipeTexts.length === 0) {
      const pages = text.split(/\f/); // Split by page breaks
      recipeTexts = pages.filter((page) => page.trim().length > 100);
      console.log(`📄 Split into ${recipeTexts.length} pages`);
    }

    // Create chunks from recipes
    recipeTexts.forEach((recipeText, index) => {
      if (recipeText.trim().length > 50) {
        const chunk = {
          id: `recipe_${index}`,
          text: recipeText.trim(),
          metadata: {
            pageNumber: Math.floor(index / 2) + 1,
            recipeName: extractRecipeName(recipeText),
            mealType: extractMealType(recipeText),
            ingredients: extractIngredients(recipeText),
            dietaryInfo: extractDietaryInfo(recipeText),
            prepTime: extractPrepTime(recipeText),
            servingSize: extractServingSize(recipeText),
          },
        };
        chunks.push(chunk);
      }
    });

    console.log(`✅ Created ${chunks.length} recipe chunks from PDF`);
    return chunks;
  } catch (error) {
    console.error("❌ Error chunking PDF:", error);
    throw error;
  }
}

/**
 * Generate embeddings for text chunks
 */
async function generateEmbeddings(chunks) {
  try {
    console.log(`🔄 Generating embeddings for ${chunks.length} chunks...`);

    const chunksWithEmbeddings = [];

    // Process chunks in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      console.log(
        `🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          chunks.length / batchSize
        )}`
      );

      const embeddings = await Promise.all(
        batch.map((chunk) =>
          openai.embeddings.create({
            model: "text-embedding-3-small", // 1024 dimensions
            input: chunk.text,
          })
        )
      );

      batch.forEach((chunk, index) => {
        chunk.embedding = embeddings[index].data[0].embedding;
        chunksWithEmbeddings.push(chunk);
      });

      // Add delay to avoid rate limits
      if (i + batchSize < chunks.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(
      `✅ Generated embeddings for ${chunksWithEmbeddings.length} chunks`
    );
    return chunksWithEmbeddings;
  } catch (error) {
    console.error("❌ Error generating embeddings:", error);
    throw error;
  }
}

/**
 * Upload chunks to Pinecone
 */
async function uploadToPinecone(chunks) {
  try {
    console.log(
      `🚀 Connecting to Pinecone index: ${CONFIG.PINECONE_INDEX_NAME}`
    );

    const index = pinecone.Index(CONFIG.PINECONE_INDEX_NAME);

    // Prepare vectors for Pinecone
    const vectors = chunks.map((chunk) => ({
      id: chunk.id,
      values: chunk.embedding,
      metadata: chunk.metadata,
    }));

    console.log(`🚀 Uploading ${vectors.length} vectors to Pinecone...`);

    // Upload in batches
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await index.upsert(batch);
      console.log(
        `✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          vectors.length / batchSize
        )}`
      );
    }

    console.log(
      `🎉 Successfully uploaded ${vectors.length} recipe chunks to Pinecone!`
    );
  } catch (error) {
    console.error("❌ Error uploading to Pinecone:", error);
    throw error;
  }
}

/**
 * Main function to initialize vector database
 */
async function initializeVectorDatabase() {
  try {
    console.log("🚀 Starting vector database initialization...");
    console.log(`📁 PDF Path: ${CONFIG.PDF_PATH}`);
    console.log(`🗂️  Pinecone Index: ${CONFIG.PINECONE_INDEX_NAME}`);

    // Step 1: Chunk the PDF
    const chunks = await chunkPDF(CONFIG.PDF_PATH);
    if (chunks.length === 0) {
      console.log("⚠️  No chunks created from PDF");
      return;
    }

    // Step 2: Generate embeddings
    const chunksWithEmbeddings = await generateEmbeddings(chunks);

    // Step 3: Upload to Pinecone
    await uploadToPinecone(chunksWithEmbeddings);

    console.log("🎉 Vector database initialization completed successfully!");
    console.log(`📊 Summary: ${chunks.length} recipes uploaded to Pinecone`);
  } catch (error) {
    console.error("❌ Error initializing vector database:", error);
    process.exit(1);
  }
}

// Helper functions to extract recipe metadata
function extractRecipeName(text) {
  const patterns = [
    /Recipe:\s*(.+?)(?:\n|$)/i,
    /^(.+?)(?:\n|Ingredients|Directions)/i,
    /([A-Z][A-Z\s]+)(?=\n\s*Ingredients)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return "Unnamed Recipe";
}

function extractMealType(text) {
  const mealTypes = [
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "appetizer",
    "dessert",
  ];
  const lowerText = text.toLowerCase();

  for (const mealType of mealTypes) {
    if (lowerText.includes(mealType)) {
      return mealType;
    }
  }
  return "general";
}

function extractIngredients(text) {
  const ingredientPatterns = [
    /Ingredients?:\s*([\s\S]+?)(?=\n\s*(?:Directions?|Instructions?|Method|$))/i,
    /([\s\S]+?)(?=\n\s*(?:Directions?|Instructions?|Method|$))/i,
  ];

  for (const pattern of ingredientPatterns) {
    const match = text.match(pattern);
    if (match) {
      const ingredientsText = match[1];
      return ingredientsText
        .split(/[\n\r,;]/)
        .map((ing) => ing.trim())
        .filter(
          (ing) => ing.length > 0 && !ing.toLowerCase().includes("directions")
        )
        .slice(0, 20); // Limit to 20 ingredients
    }
  }
  return [];
}

function extractDietaryInfo(text) {
  const dietaryTerms = [
    "vegan",
    "vegetarian",
    "gluten-free",
    "dairy-free",
    "keto",
    "paleo",
    "low-carb",
    "high-protein",
    "low-fat",
    "sugar-free",
    "nut-free",
  ];

  const lowerText = text.toLowerCase();
  return dietaryTerms.filter((term) => lowerText.includes(term));
}

function extractPrepTime(text) {
  const timePatterns = [
    /(?:prep|preparation)\s*time[:\s]*(\d+\s*(?:min|minutes|hour|hours))/i,
    /(\d+\s*(?:min|minutes|hour|hours))/i,
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return "";
}

function extractServingSize(text) {
  const servingPatterns = [
    /serves?\s*(\d+)/i,
    /(\d+)\s*servings?/i,
    /yield[s]?\s*(\d+)/i,
  ];

  for (const pattern of servingPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return "";
}

// Check configuration
function checkConfig() {
  const errors = [];

  if (
    !CONFIG.PINECONE_API_KEY ||
    CONFIG.PINECONE_API_KEY === "your-pinecone-api-key-here"
  ) {
    errors.push("❌ PINECONE_API_KEY not set");
  }

  if (
    !CONFIG.OPENAI_API_KEY ||
    CONFIG.OPENAI_API_KEY === "your-openai-api-key-here"
  ) {
    errors.push("❌ OPENAI_API_KEY not set");
  }

  if (!fs.existsSync(CONFIG.PDF_PATH)) {
    errors.push(`❌ PDF file not found: ${CONFIG.PDF_PATH}`);
  }

  if (errors.length > 0) {
    console.log("❌ Configuration errors:");
    errors.forEach((error) => console.log(error));
    console.log(
      "\n📝 Please update the CONFIG object at the top of this file with your actual values."
    );
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  checkConfig();
  initializeVectorDatabase();
}

module.exports = {
  initializeVectorDatabase,
  chunkPDF,
  generateEmbeddings,
  uploadToPinecone,
};
