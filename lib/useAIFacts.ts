/**
 * Custom hook for AI facts functionality
 * Provides a clean interface for components to use AI-powered facts
 */

import { useState, useCallback } from "react";

interface MovieData {
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
  vote_average?: number;
}

interface UseAIFactsReturn {
  facts: string[];
  isLoading: boolean;
  error: string | null;
  hasGenerated: boolean;
  generateFacts: (movieData: MovieData) => Promise<void>;
  resetFacts: () => void;
}

/**
 * Hook for managing AI facts generation
 */
export function useAIFacts(): UseAIFactsReturn {
  const [facts, setFacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateFacts = useCallback(async (movieData: MovieData) => {
    if (!movieData) {
      setError("Movie data not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-facts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movieData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.facts) {
        setFacts(data.facts);
        setHasGenerated(true);
      } else {
        throw new Error("No facts received from AI");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetFacts = useCallback(() => {
    setFacts([]);
    setError(null);
    setHasGenerated(false);
  }, []);

  return {
    facts,
    isLoading,
    error,
    hasGenerated,
    generateFacts,
    resetFacts,
  };
}

export type { MovieData };
