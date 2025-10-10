/**
 * Fact Verification Service
 * Orchestrates web search to verify movie/TV facts and prevent AI hallucination
 */

import { getSearchService, type MovieSearchFacts } from "./searchService";
import { getLogger } from "./logger";

interface VerifiedFacts {
  lead_actor: string | null;
  director: string | null;
  box_office: string | null;
  awards: string[];
  controversies: string[];
  verification_timestamp: string;
  search_confidence: "high" | "medium" | "low";
}

class FactVerificationService {
  private logger = getLogger();
  private cache = new Map<string, VerifiedFacts>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Generate cache key for movie
   */
  private getCacheKey(title: string, year?: string): string {
    return `${title.toLowerCase().trim()}-${year || "unknown"}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isValidCache(facts: VerifiedFacts): boolean {
    const cacheAge = Date.now() - new Date(facts.verification_timestamp).getTime();
    return cacheAge < this.CACHE_TTL;
  }

  /**
   * Clean and validate extracted information
   */
  private cleanInfo(info: string | undefined): string | null {
    if (!info?.trim()) return null;
    
    const cleaned = info.trim().replace(/\s+/g, " ");
    
    // Filter out invalid information
    if (cleaned.length < 3 || 
        cleaned.toLowerCase().includes("unknown") || 
        cleaned.toLowerCase().includes("not available")) {
      return null;
    }
    
    return cleaned;
  }

  /**
   * Assess search confidence based on available facts
   */
  private assessConfidence(searchResults: MovieSearchFacts): "high" | "medium" | "low" {
    let score = 0;

    if (searchResults.lead_actor?.length > 10) score += 3;
    if (searchResults.director?.length > 5) score += 2;
    if (searchResults.box_office?.length > 10) score += 2;
    if (searchResults.awards?.length > 0) score += 1;
    if (searchResults.controversies?.length > 0) score += 1;

    if (score >= 6) return "high";
    if (score >= 3) return "medium";
    return "low";
  }

  /**
   * Verify facts for a movie with caching
   */
  async verifyFacts(title: string, year?: string): Promise<VerifiedFacts> {
    const cacheKey = this.getCacheKey(title, year);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValidCache(cached)) {
      this.logger.info(`Using cached facts for: ${title}`);
      return cached;
    }

    this.logger.info(`Verifying facts for: ${title} (${year || "unknown year"})`);

    try {
      const searchService = getSearchService();
      
      // Perform single comprehensive search (ONLY 1 API CALL)
      const searchResults = await searchService.searchMovieFacts(title, year);
      
      const verifiedFacts: VerifiedFacts = {
        lead_actor: this.cleanInfo(searchResults.lead_actor),
        director: this.cleanInfo(searchResults.director),
        box_office: this.cleanInfo(searchResults.box_office),
        awards: searchResults.awards?.map(a => this.cleanInfo(a)).filter(Boolean) as string[] || [],
        controversies: searchResults.controversies?.map(c => this.cleanInfo(c)).filter(Boolean) as string[] || [],
        verification_timestamp: new Date().toISOString(),
        search_confidence: this.assessConfidence(searchResults),
      };

      // Cache the results
      this.cache.set(cacheKey, verifiedFacts);

      this.logger.info(`Fact verification completed for: ${title}`, {
        confidence: verifiedFacts.search_confidence,
        facts_found: [verifiedFacts.lead_actor, verifiedFacts.director, verifiedFacts.box_office].filter(Boolean).length,
        api_calls_used: 1,
      });

      return verifiedFacts;
    } catch (error) {
      this.logger.error(`Fact verification failed for: ${title}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return this.createEmptyFacts();
    }
  }

  /**
   * Create empty facts object when verification fails
   */
  private createEmptyFacts(): VerifiedFacts {
    return {
      lead_actor: null,
      director: null,
      box_office: null,
      awards: [],
      controversies: [],
      verification_timestamp: new Date().toISOString(),
      search_confidence: "low",
    };
  }

  /**
   * Format verified facts for AI prompt
   */
  formatFactsForPrompt(facts: VerifiedFacts): string {
    const sections: string[] = [];

    sections.push("=== VERIFIED FACTS (Use ONLY these verified details) ===");

    if (facts.lead_actor) sections.push(`VERIFIED LEAD ACTOR: ${facts.lead_actor}`);
    if (facts.director) sections.push(`VERIFIED DIRECTOR: ${facts.director}`);
    if (facts.box_office) sections.push(`VERIFIED BOX OFFICE: ${facts.box_office}`);
    if (facts.awards.length > 0) sections.push(`VERIFIED AWARDS: ${facts.awards.join("; ")}`);
    if (facts.controversies.length > 0) sections.push(`VERIFIED NOTABLE EVENTS: ${facts.controversies.join("; ")}`);

    sections.push(`VERIFICATION CONFIDENCE: ${facts.search_confidence.toUpperCase()}`);
    sections.push("=== END VERIFIED FACTS ===");
    sections.push("");
    sections.push("IMPORTANT: You MUST use only the verified facts above. Do NOT make up any information not provided.");

    return sections.join("\n");
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    let expiredCount = 0;
    for (const [key, facts] of this.cache.entries()) {
      if (!this.isValidCache(facts)) {
        this.cache.delete(key);
        expiredCount++;
      }
    }
    if (expiredCount > 0) {
      this.logger.info(`Cleared ${expiredCount} expired cache entries`);
    }
  }
}

// Singleton instance
let factVerificationInstance: FactVerificationService | null = null;

/**
 * Get or create FactVerificationService instance
 */
export function getFactVerificationService(): FactVerificationService {
  if (!factVerificationInstance) {
    factVerificationInstance = new FactVerificationService();
  }
  return factVerificationInstance;
}

export type { VerifiedFacts };