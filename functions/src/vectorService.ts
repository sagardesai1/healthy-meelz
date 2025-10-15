import { Pinecone } from "@pinecone-database/pinecone";
import { defineString } from "firebase-functions/params";
import pdf from "pdf-parse";
import * as fs from "fs";

// Define parameters for Pinecone configuration
const pineconeApiKey = defineString("PINECONE_API_KEY");
const pineconeIndexName = defineString("PINECONE_INDEX_NAME");

export interface RecipeChunk {
  id: string;
  text: string;
  metadata: {
    pageNumber: number;
    recipeName?: string;
    mealType?: string;
    ingredients?: string[];
    dietaryInfo?: string[];
    prepTime?: string;
    servingSize?: string;
  };
  embedding?: number[];
}

export class VectorService {
  private pinecone: Pinecone | null = null;
  private index: any = null;

  private async getPineconeClient() {
    if (!this.pinecone) {
      this.pinecone = new Pinecone({
        apiKey: pineconeApiKey.value(),
      });
    }
    return this.pinecone;
  }

  private async getIndex() {
    if (!this.index) {
      const pinecone = await this.getPineconeClient();
      this.index = pinecone.Index(pineconeIndexName.value());
    }
    return this.index;
  }

  /**
   * Chunk PDF into recipe-sized pieces
   */
  async chunkPDF(pdfPath: string): Promise<RecipeChunk[]> {
    try {
      const pdfBuffer = fs.readFileSync(pdfPath);
      const data = await pdf(pdfBuffer);

      const chunks: RecipeChunk[] = [];
      const text = data.text;

      // Split by recipe patterns (you may need to adjust based on your PDF format)
      const recipePatterns = [
        /\n\s*Recipe\s*:\s*(.+?)(?=\n\s*Recipe\s*:|$)/gi,
        /\n\s*\d+\.\s*(.+?)(?=\n\s*\d+\.\s*|$)/gi,
        /\n\s*[A-Z][A-Z\s]+(?=\n\s*Ingredients:|$)/gi,
      ];

      let recipeTexts: string[] = [];

      // Try different patterns to extract recipes
      for (const pattern of recipePatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          recipeTexts = matches;
          break;
        }
      }

      // If no recipes found with patterns, split by pages or paragraphs
      if (recipeTexts.length === 0) {
        const pages = text.split(/\f/); // Split by page breaks
        recipeTexts = pages.filter((page) => page.trim().length > 100);
      }

      // Create chunks from recipes
      recipeTexts.forEach((recipeText, index) => {
        if (recipeText.trim().length > 50) {
          const chunk: RecipeChunk = {
            id: `recipe_${index}`,
            text: recipeText.trim(),
            metadata: {
              pageNumber: Math.floor(index / 2) + 1,
              recipeName: this.extractRecipeName(recipeText),
              mealType: this.extractMealType(recipeText),
              ingredients: this.extractIngredients(recipeText),
              dietaryInfo: this.extractDietaryInfo(recipeText),
              prepTime: this.extractPrepTime(recipeText),
              servingSize: this.extractServingSize(recipeText),
            },
          };
          chunks.push(chunk);
        }
      });

      console.log(`Created ${chunks.length} recipe chunks from PDF`);
      return chunks;
    } catch (error) {
      console.error("Error chunking PDF:", error);
      return [];
    }
  }

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(chunks: RecipeChunk[]): Promise<RecipeChunk[]> {
    try {
      const openai = require("openai");
      const client = new openai.OpenAI({
        apiKey:
          process.env.OPENAI_API_KEY ||
          require("firebase-functions").config().openai.api_key,
      });

      const chunksWithEmbeddings: RecipeChunk[] = [];

      // Process chunks in batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);

        const embeddings = await Promise.all(
          batch.map((chunk) =>
            client.embeddings.create({
              model: "text-embedding-3-small", // Updated to use 1024-dimension model
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
        `Generated embeddings for ${chunksWithEmbeddings.length} chunks`
      );
      return chunksWithEmbeddings;
    } catch (error) {
      console.error("Error generating embeddings:", error);
      return chunks;
    }
  }

  /**
   * Upload chunks to Pinecone
   */
  async uploadChunks(chunks: RecipeChunk[]): Promise<void> {
    try {
      const index = await this.getIndex();

      // Prepare vectors for Pinecone
      const vectors = chunks.map((chunk) => ({
        id: chunk.id,
        values: chunk.embedding!,
        metadata: chunk.metadata,
      }));

      // Upload in batches
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await index.upsert(batch);
        console.log(
          `Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            vectors.length / batchSize
          )}`
        );
      }

      console.log(
        `Successfully uploaded ${vectors.length} recipe chunks to Pinecone`
      );
    } catch (error) {
      console.error("Error uploading to Pinecone:", error);
      throw error;
    }
  }

  /**
   * Search for relevant recipes
   */
  async searchRecipes(
    query: string,
    filters?: {
      mealType?: string;
      ingredients?: string[];
      dietaryRestrictions?: string[];
    },
    topK: number = 10
  ): Promise<RecipeChunk[]> {
    try {
      const index = await this.getIndex();

      // Generate embedding for query
      const openai = require("openai");
      const client = new openai.OpenAI({
        apiKey:
          process.env.OPENAI_API_KEY ||
          require("firebase-functions").config().openai.api_key,
      });

      const queryEmbedding = await client.embeddings.create({
        model: "text-embedding-3-small", // Updated to use 1024-dimension model
        input: query,
      });

      // Build filter for Pinecone
      let filter: any = {};
      if (filters?.mealType) {
        filter.mealType = { $eq: filters.mealType };
      }
      if (filters?.ingredients && filters.ingredients.length > 0) {
        filter.ingredients = { $in: filters.ingredients };
      }
      if (
        filters?.dietaryRestrictions &&
        filters.dietaryRestrictions.length > 0
      ) {
        filter.dietaryInfo = { $nin: filters.dietaryRestrictions };
      }

      // Search Pinecone
      const searchResponse = await index.query({
        vector: queryEmbedding.data[0].embedding,
        topK,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        includeMetadata: true,
      });

      // Convert results to RecipeChunk format
      const results: RecipeChunk[] =
        searchResponse.matches?.map((match: any) => ({
          id: match.id,
          text: "", // Pinecone doesn't store the full text, just metadata
          metadata: match.metadata as any,
        })) || [];

      return results;
    } catch (error) {
      console.error("Error searching recipes:", error);
      return [];
    }
  }

  /**
   * Initialize the vector database with PDF content
   */
  async initializeVectorDB(pdfPath: string): Promise<void> {
    try {
      console.log("Starting vector database initialization...");

      // Step 1: Chunk the PDF
      const chunks = await this.chunkPDF(pdfPath);
      if (chunks.length === 0) {
        console.log("No chunks created from PDF");
        return;
      }

      // Step 2: Generate embeddings
      const chunksWithEmbeddings = await this.generateEmbeddings(chunks);

      // Step 3: Upload to Pinecone
      await this.uploadChunks(chunksWithEmbeddings);

      console.log("Vector database initialization completed successfully!");
    } catch (error) {
      console.error("Error initializing vector database:", error);
      throw error;
    }
  }

  // Helper methods to extract recipe metadata
  private extractRecipeName(text: string): string {
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

  private extractMealType(text: string): string {
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

  private extractIngredients(text: string): string[] {
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

  private extractDietaryInfo(text: string): string[] {
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

  private extractPrepTime(text: string): string {
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

  private extractServingSize(text: string): string {
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
}
