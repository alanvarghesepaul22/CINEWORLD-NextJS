/**
 * Gemini AI Service for Movie & Series Insights
 * Based on official Google GenAI API documentation
 * https://ai.google.dev/gemini-api/docs/quickstart#javascript
 */

import { GoogleGenAI } from "@google/genai";

interface MovieData {
  title?: string;
  release_date?: string;
  overview?: string;
  genre_ids?: number[];
  vote_average?: number;
  name?: string; // For TV series
  first_air_date?: string; // For TV series
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
    type: 'movie' | 'series';
    overview: string;
    reason: string;
    searchKeyword: string;
  };
  success: boolean;
  error?: string;
}

class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    // The GoogleGenAI client gets the API key from the environment variable or constructor
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Creates an expert-level prompt for extracting fascinating movie/series facts
   */
  private createMoviePrompt(data: MovieData): string {
    const isTV = "name" in data;
    const title = isTV ? data.name : data.title;
    const releaseYear = isTV
      ? data.first_air_date
        ? new Date(data.first_air_date).getFullYear()
        : "Unknown"
      : data.release_date
      ? new Date(data.release_date).getFullYear()
      : "Unknown";

    return `You are a renowned film historian and entertainment industry expert. Generate exactly 10 fascinating, lesser-known facts about "${title}" (${releaseYear}).

Focus on these categories:
🎬 PRODUCTION INSIGHTS: Behind-the-scenes incidents, unique filming techniques, budget surprises, director's creative decisions
🎭 CAST & CREW STORIES: Actor preparation methods, casting decisions, on-set relationships, method acting stories
🏆 AWARDS & RECOGNITION: Oscar wins/nominations, industry records, critical vs audience reception
🎪 CULTURAL IMPACT: Box office surprises, influence on other films, controversial moments, fan theories
📰 INDUSTRY SECRETS: Studio politics, marketing campaigns, post-production challenges, legacy

${
  isTV
    ? "This is a TV series - focus on pilot episodes, season arcs, network decisions, cast changes, and television-specific production elements."
    : "This is a movie - focus on theatrical release, cinema production, and film industry context."
}

Return EXACTLY 10 facts in this JSON format:
[
  "Fascinating fact about production or casting",
  "Behind-the-scenes story or industry secret",
  "Award or recognition detail",
  "Cultural impact or legacy information",
  "Technical or creative innovation",
  "Actor or crew anecdote",
  "Box office or financial surprise",
  "Director or producer insight",
  "Location or set design detail",
  "Influence or tribute to other works"
]

IMPORTANT: 
- Each fact must be 1-2 sentences maximum
- Be specific and verifiable
- Focus on surprising or lesser-known information
- Return ONLY the JSON array, no other text`;
  }

  /**
   * Creates an expert-level prompt for generating movie/series suggestions
   */
  private createSuggestionPrompt(): string {
    return `You are a world-renowned film curator and entertainment expert with access to global cinema knowledge. Your specialty is discovering hidden gems, underrated masterpieces, and cult classics that deserve more recognition.

Generate a single exceptional movie OR TV series recommendation based on these criteria:

🎯 TARGET AUDIENCE: Cinephiles who appreciate quality storytelling, unique cinematography, and cultural significance
🌍 GLOBAL PERSPECTIVE: Include international films, indie productions, and overlooked gems from any era
🎨 ARTISTIC VALUE: Prioritize films/series with exceptional direction, performances, or innovative techniques
📚 CULT STATUS: Consider works with passionate fanbases, critical acclaim, or significant cultural impact
🔍 HIDDEN GEMS: Focus on lesser-known titles that mainstream audiences might have missed

PREFERENCE WEIGHTS:
- 40% Hidden gems and underrated titles
- 25% International and foreign language content  
- 20% Cult classics and critical darlings
- 15% Innovative or groundbreaking works

Return your recommendation in this EXACT JSON format:
{
  "title": "Exact title of the movie/series",
  "year": "Release year (for series, use first aired year)",
  "type": "movie or series",
  "overview": "2-3 sentence plot summary that captures the essence without spoilers",
  "reason": "Compelling 2-3 sentence explanation of why this is worth watching today, focusing on its unique qualities and emotional impact",
  "searchKeyword": "Most effective single search term to find this title (usually just the main title)"
}

IMPORTANT GUIDELINES:
- Choose titles that are genuinely exceptional but may be overlooked
- Avoid obvious mainstream blockbusters or extremely popular series
- Focus on works with lasting impact and rewatchability
- Ensure the title can realistically be found through search
- Return ONLY the JSON object, no other text`;
  }

  /**
   * Extracts facts from raw text using line-based parsing as fallback
   * @param text Raw response text from AI
   * @returns Array of extracted facts
   */
  private extractFactsFromText(text: string): string[] {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) =>
        line
          .replace(/^\d+\.\s*/, "")
          .replace(/^[-*•]\s*/, "")
          .trim()
      )
      .filter(
        (fact) =>
          fact.length > 20 && !fact.startsWith("{") && !fact.startsWith("[")
      )
      .slice(0, 10);

    return lines;
  }

  /**
   * Creates a standardized empty suggestion error response
   * @param error Error message to include in the response
   * @returns AISuggestionResponse with empty suggestion and error details
   */
  private createEmptySuggestionError(error: string): AISuggestionResponse {
    return {
      suggestion: {
        title: "",
        year: "",
        type: "movie",
        overview: "",
        reason: "",
        searchKeyword: ""
      },
      success: false,
      error: error,
    };
  }

  /**
   * Creates a standardized empty facts error response
   * @param error Error message to include in the response
   * @returns AIFactsResponse with empty facts array and error details
   */
  private createEmptyFactsError(error: string): AIFactsResponse {
    return {
      facts: [],
      success: false,
      error: error,
    };
  }

  /**
   * Generates AI-powered movie/series suggestion
   */
  async generateSuggestion(): Promise<AISuggestionResponse> {
    try {
      const prompt = this.createSuggestionPrompt();

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (!response.text || response.text.trim().length === 0) {
        throw new Error("Empty response from Gemini API");
      }

      // Clean and parse the JSON response
      const cleanedText = response.text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "");

      try {
        const suggestion = JSON.parse(cleanedText);

        // Validate the suggestion structure
        if (
          suggestion &&
          typeof suggestion === 'object' &&
          suggestion.title &&
          suggestion.year &&
          suggestion.type &&
          suggestion.overview &&
          suggestion.reason &&
          suggestion.searchKeyword &&
          (suggestion.type === 'movie' || suggestion.type === 'series')
        ) {
          return {
            suggestion: {
              title: suggestion.title.trim(),
              year: suggestion.year.toString(),
              type: suggestion.type,
              overview: suggestion.overview.trim(),
              reason: suggestion.reason.trim(),
              searchKeyword: suggestion.searchKeyword.trim()
            },
            success: true,
          };
        }

        throw new Error("Invalid suggestion format received from AI");
      } catch (parseError) {
        // Log the JSON parsing error with cleaned text for debugging
        console.error('JSON parsing failed for AI suggestion response:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          cleanedText: cleanedText,
          originalResponse: response.text,
          timestamp: new Date().toISOString()
        });

        throw new Error("Failed to parse AI suggestion response");
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("api key")) {
          return this.createEmptySuggestionError("AI service authentication failed. Please check configuration.");
        }

        if (
          errorMessage.includes("quota") ||
          errorMessage.includes("rate limit")
        ) {
          return this.createEmptySuggestionError("AI service quota exceeded. Please try again later.");
        }

        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("404")
        ) {
          return this.createEmptySuggestionError("AI model temporarily unavailable. Please try again later.");
        }

        if (errorMessage.includes("blocked")) {
          return this.createEmptySuggestionError("Content was blocked by safety filters. Please try again.");
        }
      }

      return this.createEmptySuggestionError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
  async generateFacts(data: MovieData): Promise<AIFactsResponse> {
    try {
      const isTV = "name" in data;
      const title = isTV ? data.name : data.title;

      if (!title) {
        throw new Error("Title is required");
      }

      const prompt = this.createMoviePrompt(data);

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (!response.text || response.text.trim().length === 0) {
        throw new Error("Empty response from Gemini API");
      }

      // Clean and parse the JSON response
      const cleanedText = response.text
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/```\s*$/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "");

      try {
        const facts = JSON.parse(cleanedText);

        if (Array.isArray(facts) && facts.length > 0) {
          const validFacts = facts
            .filter(
              (fact) => typeof fact === "string" && fact.trim().length > 10
            )
            .slice(0, 10);

          if (validFacts.length > 0) {
            return {
              facts: validFacts,
              success: true,
            };
          }
        }

        throw new Error("Invalid facts format received from AI");
      } catch (parseError) {
        // Log the JSON parsing error with raw response for debugging
        console.error('JSON parsing failed for AI facts response:', {
          error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          rawResponse: response.text,
          timestamp: new Date().toISOString()
        });

        // Fallback: Extract facts using helper method
        const extractedFacts = this.extractFactsFromText(response.text);

        if (extractedFacts.length > 0) {
          return {
            facts: extractedFacts,
            success: true,
          };
        }

        throw new Error("Failed to extract facts from AI response");
      }
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("api key")) {
          return this.createEmptyFactsError(
            "AI service authentication failed. Please check configuration."
          );
        }

        if (
          errorMessage.includes("quota") ||
          errorMessage.includes("rate limit")
        ) {
          return this.createEmptyFactsError("AI service quota exceeded. Please try again later.");
        }

        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("404")
        ) {
          return this.createEmptyFactsError("AI model temporarily unavailable. Please try again later.");
        }

        if (errorMessage.includes("blocked")) {
          return this.createEmptyFactsError(
            "Content was blocked by safety filters. Please try a different title."
          );
        }
      }

      return this.createEmptyFactsError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
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

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    geminiServiceInstance = new GeminiService(apiKey);
  }
  return geminiServiceInstance;
}

export type { MovieData, AIFactsResponse, AISuggestionResponse };
