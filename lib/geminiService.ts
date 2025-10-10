/**
 * Gemini AI Service for Movie & Series Insights
 * Clean, streamlined implementation with fact verification
 */

import { GoogleGenAI } from "@google/genai";
import { getLogger } from "./logger";
import { type VerifiedFacts, getFactVerificationService } from "./factVerificationService";

interface MovieData {
  title?: string;
  name?: string; // For TV series
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
  vote_average?: number;
  id?: number;
  director?: string;
  cast?: string[];
  runtime?: number;
  genres?: { id?: number; name: string }[];
  production_companies?: { name: string }[];
  original_language?: string;
  // TV-specific fields
  created_by?: { name: string }[];
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  networks?: { name: string }[];
  // Verified facts from web search
  verified_facts?: VerifiedFacts;
}

interface AIFactsResponse {
  facts: string[];
  success: boolean;
  error?: string;
}

interface AISuggestionResponse {
  suggestion: {
    title: string;
    year: string;
    type: "movie" | "series";
    overview: string;
    reason: string;
    searchKeyword: string;
  };
  success: boolean;
  error?: string;
}

class GeminiService {
  private ai: GoogleGenAI;
  private logger = getLogger();
  private readonly MODEL_NAME = "gemini-2.5-flash";

  constructor(apiKey: string) {
    if (!apiKey?.trim()) {
      throw new Error("Invalid API key provided");
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.logger.info("GeminiService initialized successfully");
  }

  /**
   * Creates prompt for generating movie/series facts with verified information
   */
  private createMoviePrompt(data: MovieData): string {
    const isTV = !!data.name;
    const title = isTV ? data.name : data.title;
    const releaseYear = isTV
      ? data.first_air_date ? new Date(data.first_air_date).getFullYear() : "Unknown"
      : data.release_date ? new Date(data.release_date).getFullYear() : "Unknown";

    // Include verified facts if available
    const verifiedFactsSection = data.verified_facts 
      ? this.formatVerifiedFacts(data.verified_facts)
      : "";

    return `You are an expert cinematic researcher generating exciting facts about movies and TV shows.

${verifiedFactsSection}

GOAL: Generate Top 10 most exciting facts about "${title}" (${releaseYear}) - a ${isTV ? "TV Series" : "Movie"}.

${data.verified_facts ? 
`IMPORTANT: Use ONLY the verified facts provided above. Transform them into compelling narratives without adding unverified information.` :
`Focus on verifiable facts like box office performance, awards, cast details, production stories, and notable controversies.`}

Basic Info:
- Overview: ${data.overview || "Not available"}
- Language: ${data.original_language || "en"}
- Genres: ${data.genres?.map(g => g.name).join(", ") || "various"}
- Runtime: ${data.runtime ? `${data.runtime} minutes` : "not specified"}
${data.production_companies?.length ? `- Producers: ${data.production_companies.map(pc => pc.name).join(", ")}` : ""}
${isTV && data.created_by?.length ? `- Creators: ${data.created_by.map(c => c.name).join(", ")}` : ""}
${isTV && data.networks?.length ? `- Networks: ${data.networks.map(n => n.name).join(", ")}` : ""}
${isTV && data.number_of_seasons ? `- Seasons: ${data.number_of_seasons}, Episodes: ${data.number_of_episodes}` : ""}

Requirements:
1. ${data.verified_facts ? "Use ONLY verified facts above" : "Focus on verifiable, exciting details"}
2. Format as compelling, single-paragraph facts
3. Include box office/streaming performance if available
4. Cover production stories, cast details, awards, controversies
5. Make each fact attention-grabbing and viral-worthy

Return exactly 10 facts as JSON array:
["Exciting fact 1", "Exciting fact 2", ...]

Return ONLY the JSON array, no other text.`;
  }

  /**
   * Formats verified facts for AI prompt
   */
  private formatVerifiedFacts(facts: VerifiedFacts): string {
    const sections: string[] = [];

    sections.push("=== VERIFIED FACTS (Use ONLY these details) ===");

    if (facts.lead_actor) sections.push(`VERIFIED LEAD ACTOR: ${facts.lead_actor}`);
    if (facts.director) sections.push(`VERIFIED DIRECTOR: ${facts.director}`);
    if (facts.box_office) sections.push(`VERIFIED BOX OFFICE: ${facts.box_office}`);
    if (facts.awards.length > 0) sections.push(`VERIFIED AWARDS: ${facts.awards.join("; ")}`);
    if (facts.controversies.length > 0) sections.push(`VERIFIED EVENTS: ${facts.controversies.join("; ")}`);

    sections.push(`VERIFICATION CONFIDENCE: ${facts.search_confidence.toUpperCase()}`);
    sections.push("=== END VERIFIED FACTS ===");
    sections.push("");

    return sections.join("\n");
  }

  /**
   * Creates prompt for generating movie/series suggestions
   */
  private createSuggestionPrompt(): string {
    return `You are a film curator recommending hidden gems and underrated titles.

Recommend one exceptional movie or TV series that deserves more recognition.

Focus on:
- Hidden gems and cult classics
- International and independent films
- Critically acclaimed but overlooked titles

Return as JSON:
{
  "title": "Exact title",
  "year": "Release year",
  "type": "movie or series",
  "overview": "2-3 sentence plot summary",
  "reason": "Why this is worth watching",
  "searchKeyword": "Best search term"
}

Return ONLY the JSON object, no other text.`;
  }

  /**
   * Parses JSON response with fallback
   */
  private parseFactsResponse(responseText: string): string[] {
    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const facts = JSON.parse(cleanedText);
      if (Array.isArray(facts) && facts.length > 0) {
        return facts
          .filter((fact) => typeof fact === "string" && fact.trim().length > 10)
          .slice(0, 10);
      }
    } catch {
      // Fallback: extract from text
      return responseText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 20 && !line.startsWith("{") && !line.startsWith("["))
        .map((line) => line.replace(/^\d+\.\s*/, "").replace(/^[-*•]\s*/, "").trim())
        .slice(0, 10);
    }

    return [];
  }

  /**
   * Parses suggestion response
   */
  private parseSuggestionResponse(responseText: string) {
    const cleanedText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const suggestion = JSON.parse(cleanedText);

    if (!suggestion?.title || !suggestion?.year || !suggestion?.type || 
        !suggestion?.overview || !suggestion?.reason || !suggestion?.searchKeyword) {
      throw new Error("Invalid suggestion format");
    }

    if (suggestion.type !== "movie" && suggestion.type !== "series") {
      throw new Error("Invalid suggestion type");
    }

    return {
      title: suggestion.title.trim(),
      year: suggestion.year.toString(),
      type: suggestion.type,
      overview: suggestion.overview.trim(),
      reason: suggestion.reason.trim(),
      searchKeyword: suggestion.searchKeyword.trim(),
    };
  }

  /**
   * Handles API errors
   */
  private handleError(error: Error): string {
    const message = error.message.toLowerCase();

    if (message.includes("api key") || message.includes("authentication")) {
      return "AI service authentication failed. Please check configuration.";
    }
    if (message.includes("quota") || message.includes("rate limit")) {
      return "AI service rate limit exceeded. Please try again later.";
    }
    if (message.includes("blocked") || message.includes("safety")) {
      return "Content was blocked by safety filters. Please try again.";
    }

    return error.message;
  }

  /**
   * Generates AI-powered movie/series suggestion
   */
  async generateSuggestion(): Promise<AISuggestionResponse> {
    try {
      this.logger.info("Generating AI suggestion");

      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: this.createSuggestionPrompt(),
      });

      if (!response?.text) {
        throw new Error("Empty response from Gemini API");
      }

      const suggestion = this.parseSuggestionResponse(response.text);

      this.logger.info("Successfully generated AI suggestion", {
        title: suggestion.title,
        type: suggestion.type,
      });

      return { suggestion, success: true };
    } catch (error) {
      const errorMessage = this.handleError(error as Error);
      this.logger.error("Error generating AI suggestion", { error: errorMessage });

      return {
        suggestion: {
          title: "",
          year: "",
          type: "movie",
          overview: "",
          reason: "",
          searchKeyword: "",
        },
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Generates AI-powered facts with optional web search verification
   */
  async generateFacts(data: MovieData, enableFactVerification: boolean = true): Promise<AIFactsResponse> {
    try {
      const title = data.name || data.title;

      if (!title) {
        throw new Error("Title is required");
      }

      this.logger.info("Generating AI facts", { title, enableFactVerification });

      // Attempt fact verification if enabled
      if (enableFactVerification && !data.verified_facts) {
        try {
          const factVerificationService = getFactVerificationService();
          const releaseYear = data.release_date 
            ? new Date(data.release_date).getFullYear().toString()
            : data.first_air_date 
            ? new Date(data.first_air_date).getFullYear().toString()
            : undefined;

          const verifiedFacts = await factVerificationService.verifyFacts(title, releaseYear);
          data.verified_facts = verifiedFacts;

          this.logger.info("Fact verification completed", { 
            title, 
            confidence: verifiedFacts.search_confidence,
            usedSerpApi: true,
          });
        } catch (verificationError) {
          this.logger.warn("Fact verification failed, using pure Gemini mode", {
            title,
            error: verificationError instanceof Error ? verificationError.message : "Unknown error",
          });
          // Continue without verified facts - Gemini will generate based on its training data
        }
      }

      // Use enhanced prompt if verification failed or was skipped
      const prompt = !data.verified_facts && enableFactVerification 
        ? this.createFallbackPrompt(data)
        : this.createMoviePrompt(data);

      const response = await this.ai.models.generateContent({
        model: this.MODEL_NAME,
        contents: prompt,
      });

      if (!response?.text) {
        throw new Error("Empty response from Gemini API");
      }

      const facts = this.parseFactsResponse(response.text);

      if (facts.length === 0) {
        throw new Error("No valid facts extracted from AI response");
      }

      this.logger.info("Successfully generated AI facts", {
        title,
        factsCount: facts.length,
        withVerification: !!data.verified_facts,
        mode: data.verified_facts ? "verified" : "pure-gemini",
      });

      return { facts, success: true };
    } catch (error) {
      const errorMessage = this.handleError(error as Error);
      this.logger.error("Error generating AI facts", { error: errorMessage });

      return {
        facts: [],
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Creates fallback prompt for pure Gemini mode (when SerpApi fails)
   */
  private createFallbackPrompt(data: MovieData): string {
    const isTV = !!data.name;
    const title = isTV ? data.name : data.title;
    const releaseYear = isTV
      ? data.first_air_date ? new Date(data.first_air_date).getFullYear() : "Unknown"
      : data.release_date ? new Date(data.release_date).getFullYear() : "Unknown";

    return `You are an expert cinematic researcher with deep knowledge of movies and TV shows.

GOAL: Generate Top 10 most exciting and factual information about "${title}" (${releaseYear}) - a ${isTV ? "TV Series" : "Movie"}.

IMPORTANT: Use only your training data knowledge. Focus on well-known, verifiable facts that would be commonly reported.

Basic Info:
- Overview: ${data.overview || "Not available"}
- Language: ${data.original_language || "en"}
- Genres: ${data.genres?.map(g => g.name).join(", ") || "various"}
- Runtime: ${data.runtime ? `${data.runtime} minutes` : "not specified"}
${data.production_companies?.length ? `- Producers: ${data.production_companies.map(pc => pc.name).join(", ")}` : ""}
${isTV && data.created_by?.length ? `- Creators: ${data.created_by.map(c => c.name).join(", ")}` : ""}
${isTV && data.networks?.length ? `- Networks: ${data.networks.map(n => n.name).join(", ")}` : ""}
${isTV && data.number_of_seasons ? `- Seasons: ${data.number_of_seasons}, Episodes: ${data.number_of_episodes}` : ""}

Requirements:
1. Focus on widely-known, well-documented facts from your training data
2. Include cast information, production details, reception, and notable achievements
3. Avoid speculation or uncertain information
4. Format as compelling, single-paragraph facts
5. Cover performance, critical reception, cultural impact, and notable trivia
6. Make each fact attention-grabbing and informative

Return exactly 10 facts as JSON array:
["Well-documented fact 1", "Well-documented fact 2", ...]

Return ONLY the JSON array, no other text.`;
  }
}

// Singleton instance
let geminiServiceInstance: GeminiService | null = null;

/**
 * Get or create Gemini service instance
 */
export function getGeminiService(): GeminiService {
  if (!geminiServiceInstance) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey?.trim()) {
      const logger = getLogger();
      logger.error("GEMINI_API_KEY environment variable is not configured");
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }

    geminiServiceInstance = new GeminiService(apiKey);
  }
  return geminiServiceInstance;
}

export type { MovieData, AIFactsResponse, AISuggestionResponse };
