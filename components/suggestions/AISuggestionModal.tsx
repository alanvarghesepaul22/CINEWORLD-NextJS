"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Search,
  Calendar,
  Film,
  Tv,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface AISuggestion {
  title: string;
  year: string;
  type: "movie" | "series";
  overview: string;
  reason: string;
  searchKeyword: string;
}

// Type guard function
function isValidSuggestion(data: unknown): data is AISuggestion {
  return (
    typeof data === "object" &&
    data !== null &&
    "title" in data &&
    "year" in data &&
    "type" in data &&
    "overview" in data &&
    "reason" in data &&
    "searchKeyword" in data &&
    typeof (data as AISuggestion).title === "string" &&
    typeof (data as AISuggestion).year === "string" &&
    ((data as AISuggestion).type === "movie" ||
      (data as AISuggestion).type === "series") &&
    typeof (data as AISuggestion).overview === "string" &&
    typeof (data as AISuggestion).reason === "string" &&
    typeof (data as AISuggestion).searchKeyword === "string"
  );
}

// API Response type definition
interface AIResponse {
  success?: boolean;
  suggestion?: AISuggestion;
  error?: string;
}

interface AISuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AISuggestionModal = ({ isOpen, onClose }: AISuggestionModalProps) => {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup abort controller and timeout on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Generate a new AI suggestion
   */
  const generateSuggestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Abort previous request and clear timeout if they exist
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Setup new abort controller and timeout
      abortControllerRef.current = new AbortController();
      timeoutRef.current = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, 30000); // 30s timeout

      try {
        const response = await fetch("/api/ai-suggestions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current.signal,
        });

        // Safely parse response body with fallback to text
        let data: AIResponse | null;
        let responseBody: string;
        try {
          data = (await response.json()) as AIResponse;
          responseBody = JSON.stringify(data);
        } catch {
          // Fallback to text if JSON parsing fails
          responseBody = await response.text();
          data = null;
        }

        if (!response.ok) {
          // Create detailed error message with status and body content
          const errorMessage =
            data?.error || responseBody || `HTTP ${response.status}`;
          throw new Error(
            `Request failed (${response.status}): ${errorMessage}`
          );
        }

        if (data?.success && data?.suggestion) {
          // Validate the suggestion object structure
          const suggestionData = data.suggestion;

          if (isValidSuggestion(suggestionData)) {
            setSuggestion(suggestionData);
            setHasGenerated(true);
          } else {
            throw new Error("Invalid suggestion format received from AI");
          }
        } else {
          throw new Error("No suggestion received from AI");
        }
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    } catch (err) {
      // handle abort separately
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
        return;
      }
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array - all dependencies are stable references
  /**
   * Search for the suggested movie/series
   */
  const searchForSuggestion = () => {
    if (suggestion) {
      router.push(`/search?q=${encodeURIComponent(suggestion.searchKeyword)}`);
      onClose();
    }
  };

  /**
   * Reset modal state when opening
   */
  useEffect(() => {
    if (isOpen && !hasGenerated && !isLoading) {
      generateSuggestion();
    }
  }, [isOpen, hasGenerated, isLoading, generateSuggestion]);

  /**
   * Reset state when modal closes
   */
  const handleClose = () => {
    setSuggestion(null);
    setError(null);
    setHasGenerated(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-gray-700/50 text-white overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold bg-gradient-to-r from-theme-primary to-light-primary bg-clip-text text-transparent">
            <Sparkles className="w-5 h-5 text-theme-primary animate-pulse" />
            AI Curated Pick
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm text-center">
            Discover hidden gems and exceptional stories curated by AI
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 space-x-4">
              <div className="relative">
                <Loader2 className="w-10 h-10 text-theme-primary animate-spin" />
                <Sparkles className="w-5 h-5 text-theme-primary/70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-medium text-gray-200 mb-1">
                  Curating Your Perfect Watch
                </h3>
                <p className="text-sm text-gray-400">
                  AI is analyzing thousands of hidden gems...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-6">
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-4">
                <h3 className="text-base font-medium text-red-300 mb-2">
                  Unable to Generate Suggestion
                </h3>
                <p className="text-red-400 text-sm mb-3">{error}</p>
                <Button
                  onClick={generateSuggestion}
                  variant="outline"
                  size="sm"
                  className="bg-red-900/30 border-red-700 text-red-300 hover:bg-red-900/50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Suggestion Display */}
          {suggestion && !isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column - Title and Meta */}
              <div className="lg:col-span-1 space-y-3">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    {suggestion.type === "movie" ? (
                      <Film className="w-4 h-4 text-theme-primary" />
                    ) : (
                      <Tv className="w-4 h-4 text-theme-primary" />
                    )}
                    <span className="text-xs font-medium text-theme-primary uppercase tracking-wide">
                      {suggestion.type}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1 leading-tight">
                    {suggestion.title}
                  </h2>
                  <div className="flex items-center justify-center lg:justify-start gap-1 text-gray-400 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{suggestion.year}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={searchForSuggestion}
                    className="w-full bg-theme-primary hover:bg-light-primary text-black font-medium text-sm py-2"
                    size="sm"
                  >
                    <Search className="w-3 h-3 mr-2" />
                    Find This {suggestion.type === "movie" ? "Movie" : "Series"}
                  </Button>
                  <Button
                    onClick={generateSuggestion}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-800/50 hover:text-white text-sm py-2"
                    size="sm"
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={`w-3 h-3 mr-2 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    New Pick
                  </Button>
                </div>
              </div>

              {/* Right Column - Content */}
              <div className="lg:col-span-2 space-y-3">
                {/* Overview */}
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                  <h3 className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                    Overview
                  </h3>
                  <p className="text-gray-100 leading-relaxed text-sm">
                    {suggestion.overview}
                  </p>
                </div>

                {/* Reason to Watch */}
                <div className="bg-theme-primary/10 rounded-lg p-3 border border-theme-primary/20">
                  <h3 className="text-xs font-semibold text-theme-primary mb-2 uppercase tracking-wide">
                    Why You Should Watch This
                  </h3>
                  <p className="text-gray-100 leading-relaxed text-sm">
                    {suggestion.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Branding */}
          {suggestion && !isLoading && (
            <div className="text-center text-xs text-gray-500 pt-3 mt-3 border-t border-gray-800/50">
              <span className="flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                Powered by AI • Curated for cinephiles
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISuggestionModal;
