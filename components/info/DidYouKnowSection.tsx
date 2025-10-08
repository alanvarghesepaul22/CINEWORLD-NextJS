"use client";

import React, { useState } from "react";
import { Lightbulb, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovieData {
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  genre_ids?: number[];
  vote_average?: number;
}

interface DidYouKnowSectionProps {
  title: string;
  movieData?: MovieData;
  className?: string;
}

/**
 * DidYouKnowSection - AI-powered facts section with Gemini integration
 * Provides fascinating behind-the-scenes insights and trivia
 */
const DidYouKnowSection: React.FC<DidYouKnowSectionProps> = ({
  title,
  movieData,
  className = "",
}) => {
  const [facts, setFacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  /**
   * Fetch AI-generated facts from our API
   */
  const generateFacts = async () => {
    if (!movieData) {
      setError("Movie data not available");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-facts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      if (data.success && data.facts) {
        setFacts(data.facts);
        setHasGenerated(true);
      } else {
        throw new Error('No facts received from AI');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Failed to generate AI facts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset to initial state
   */
  const resetFacts = () => {
    setFacts([]);
    setError(null);
    setHasGenerated(false);
  };

  return (
    <div className={`glass-container ${className}`}>
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white">
              Did You Know?
            </h3>
          </div>
          
          {/* AI Badge */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-blue-400/30">
            <Sparkles className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400 font-medium">AI Powered</span>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Content */}
        {!hasGenerated && !isLoading ? (
          // Initial state - Call to action
          <div className="text-center py-8 space-y-4">
            <div className="text-primary mb-4">
              <Sparkles className="w-12 h-12 mx-auto" />
            </div>
            <h4 className="text-white font-semibold text-lg mb-2">
              Discover Amazing Facts
            </h4>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Get exclusive behind-the-scenes insights, production secrets, cast stories, 
              and fascinating trivia about{" "}
              <span className="text-primary font-medium">{title}</span> powered by AI.
            </p>
            <Button
              onClick={generateFacts}
              disabled={!movieData}
              className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 
                         text-black font-semibold px-6 py-2 rounded-full smooth-transition 
                         hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate AI Facts
            </Button>
            <p className="text-gray-500 text-xs mt-3">
              Powered by Google Gemini AI
            </p>
          </div>
        ) : isLoading ? (
          // Loading state
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              <span className="text-primary font-medium">Generating fascinating facts...</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary/50 rounded-full mt-2 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-600/50 rounded w-full" />
                      <div className="h-4 bg-gray-600/50 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          // Error state
          <div className="text-center py-6 space-y-4">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <div>
              <h4 className="text-red-400 font-medium mb-2">Failed to Generate Facts</h4>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <div className="flex justify-center gap-3">
                <Button
                  onClick={generateFacts}
                  variant="outline"
                  size="sm"
                  className="border-primary/40 text-primary hover:bg-primary/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={resetFacts}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Success state - Display facts
          <div className="space-y-4">
            <ul className="space-y-4">
              {facts.map((fact, index) => (
                <li key={index} className="flex items-start gap-3 group">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0 group-hover:scale-125 smooth-transition" />
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed group-hover:text-white smooth-transition">
                    {fact}
                  </p>
                </li>
              ))}
            </ul>
            
            {/* Action buttons */}
            <div className="flex justify-center gap-3 pt-4 border-t border-gray-700/50">
              <Button
                onClick={generateFacts}
                variant="outline"
                size="sm"
                className="border-primary/40 text-primary hover:bg-primary/10"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Facts
              </Button>
              <Button
                onClick={resetFacts}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DidYouKnowSection;
