/**
 * Search Service for Movie & TV Show Fact Verification
 * Uses SerpApi to fetch real-time, verified information to prevent AI hallucination
 */

import { getLogger } from "./logger";

interface SearchResult {
  title: string;
  snippet: string;
}

interface SearchResponse {
  organic_results?: SearchResult[];
  knowledge_graph?: {
    description?: string;
  };
  answer_box?: {
    answer?: string;
  };
}

interface MovieSearchFacts {
  lead_actor?: string;
  director?: string;
  box_office?: string;
  awards?: string[];
  controversies?: string[];
}

class SearchService {
  private logger = getLogger();
  private readonly API_KEY: string;
  private readonly BASE_URL = "https://serpapi.com/search.json";
  private readonly RATE_LIMIT_DELAY = 1000; // 1 second between requests
  private lastRequestTime = 0;

  constructor(apiKey: string) {
    if (!apiKey?.trim()) {
      throw new Error("SerpApi API key is required");
    }
    this.API_KEY = apiKey;
    this.logger.info("SearchService initialized successfully");
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const waitTime = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Performs a single comprehensive search using SerpApi
   */
  private async performSearch(query: string): Promise<SearchResponse | null> {
    await this.enforceRateLimit();

    const params = new URLSearchParams({
      api_key: this.API_KEY,
      engine: "google",
      q: query,
      location: "United States",
      hl: "en",
      gl: "us",
      num: "8", // Increased to get more comprehensive results
    });

    try {
      this.logger.info(`Searching for: ${query}`);
      
      const response = await fetch(`${this.BASE_URL}?${params}`, {
        method: "GET",
        headers: { "User-Agent": "CineworldApp/1.0" },
      });

      if (!response.ok) {
        throw new Error(`SerpApi request failed: ${response.status}`);
      }

      const data = await response.json();
      
      this.logger.info(`Search completed for: ${query}`, {
        results_count: data.organic_results?.length || 0,
      });

      return data;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Search failed for query: ${query}`, {
        error: err.message,
      });

      // Return null when SerpApi fails - this will trigger fallback to pure Gemini
      return null;
    }
  }

  /**
   * Extracts comprehensive movie information from a single search result
   */
  private extractMovieInfo(results: SearchResponse): MovieSearchFacts {
    const facts: MovieSearchFacts = {};
    const allText: string[] = [];

    // Collect all text from search results
    if (results.knowledge_graph?.description) {
      allText.push(results.knowledge_graph.description);
    }

    if (results.answer_box?.answer) {
      allText.push(results.answer_box.answer);
    }

    if (results.organic_results) {
      for (const result of results.organic_results) {
        if (result.snippet) {
          allText.push(result.snippet);
        }
      }
    }

    const combinedText = allText.join(" ").toLowerCase();

    // Extract lead actor/starring information
    const actorMatches = this.extractByPatterns(combinedText, [
      /starring\s+([^,.]+)/gi,
      /lead actor\s+([^,.]+)/gi,
      /stars?\s+([^,.]+)/gi,
      /featuring\s+([^,.]+)/gi,
    ]);
    if (actorMatches.length > 0) {
      facts.lead_actor = actorMatches[0];
    }

    // Extract director information
    const directorMatches = this.extractByPatterns(combinedText, [
      /directed by\s+([^,.]+)/gi,
      /director\s+([^,.]+)/gi,
      /filmmaker\s+([^,.]+)/gi,
      /helmed by\s+([^,.]+)/gi,
    ]);
    if (directorMatches.length > 0) {
      facts.director = directorMatches[0];
    }

    // Extract box office information
    const boxOfficeMatches = this.extractByPatterns(combinedText, [
      /box office[^.]*?(\$[\d,.]+ (?:million|billion|crore))/gi,
      /grossed[^.]*?(\$[\d,.]+ (?:million|billion))/gi,
      /earned[^.]*?(\$[\d,.]+ (?:million|billion|crore))/gi,
      /budget[^.]*?(\$[\d,.]+ (?:million|billion))/gi,
    ]);
    if (boxOfficeMatches.length > 0) {
      facts.box_office = boxOfficeMatches[0];
    }

    // Extract awards information
    const awardsMatches = this.extractByPatterns(combinedText, [
      /(won[^.]*?award[^.]*)/gi,
      /(oscar[^.]*?nomination[^.]*)/gi,
      /(academy award[^.]*)/gi,
      /(golden globe[^.]*)/gi,
    ]);
    if (awardsMatches.length > 0) {
      facts.awards = awardsMatches.slice(0, 3);
    }

    // Extract controversies/notable events
    const controversyMatches = this.extractByPatterns(combinedText, [
      /(controversy[^.]*)/gi,
      /(banned[^.]*)/gi,
      /(scandal[^.]*)/gi,
      /(protest[^.]*)/gi,
    ]);
    if (controversyMatches.length > 0) {
      facts.controversies = controversyMatches.slice(0, 2);
    }

    return facts;
  }

  /**
   * Extract information using regex patterns
   */
  private extractByPatterns(text: string, patterns: RegExp[]): string[] {
    const matches: string[] = [];
    
    for (const pattern of patterns) {
      const found = text.match(pattern);
      if (found) {
        found.forEach(match => {
          const cleaned = match.replace(/[^\w\s$.,]/g, " ").trim();
          if (cleaned.length > 5 && cleaned.length < 200) {
            matches.push(cleaned);
          }
        });
      }
    }
    
    return [...new Set(matches)]; // Remove duplicates
  }

  /**
   * Single comprehensive search for all movie facts (ONLY 1 API CALL)
   */
  async searchMovieFacts(title: string, year?: string): Promise<MovieSearchFacts> {
    this.logger.info(`Starting single comprehensive fact search for: ${title} (${year || "unknown year"})`);

    try {
      // Create one comprehensive search query covering all aspects
      const comprehensiveQuery = `"${title}" ${year || ""} lead actor, starring, director, cast, box office gross earnings budget, awards, and controversy`;
      
      const searchResults = await this.performSearch(comprehensiveQuery);
      
      // Return empty facts if search failed (triggers fallback to pure Gemini)
      if (!searchResults) {
        this.logger.warn(`Search failed for: ${title}, will use pure Gemini mode`);
        return {};
      }

      const facts = this.extractMovieInfo(searchResults);

      this.logger.info(`Single fact search completed for: ${title}`, {
        lead_actor: !!facts.lead_actor,
        director: !!facts.director,
        box_office: !!facts.box_office,
        awards_count: facts.awards?.length || 0,
        controversies_count: facts.controversies?.length || 0,
        api_calls_used: 1, // Only 1 call used!
      });

      return facts;
    } catch (error) {
      this.logger.error(`Single fact search failed for: ${title}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return {};
    }
  }
}

// Singleton instance
let searchServiceInstance: SearchService | null = null;

/**
 * Get or create SearchService instance
 */
export function getSearchService(): SearchService {
  if (!searchServiceInstance) {
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey?.trim()) {
      const logger = getLogger();
      logger.error("SERPAPI_API_KEY environment variable is not configured");
      throw new Error("SERPAPI_API_KEY environment variable is not configured");
    }

    searchServiceInstance = new SearchService(apiKey);
  }
  return searchServiceInstance;
}

export type { MovieSearchFacts };