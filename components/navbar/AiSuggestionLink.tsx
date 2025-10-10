"use client";
import React, { useState } from "react";
import AISuggestionModal from "../suggestions/AISuggestionModal";
import { Sparkles } from "lucide-react";

const AiSuggestionLink = () => {
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] =
    useState<boolean>(false);

  const openSuggestionModal = (): void => {
    setIsSuggestionModalOpen(true);
  };
  return (
    <>
      <button
        type="button"
        onClick={openSuggestionModal}
        className="p-1 rounded-lg bg-gradient-to-r from-theme-primary/20 to-theme-primary/10 hover:from-theme-primary/30 hover:to-theme-primary/20 border border-theme-primary/50 transition-all duration-200 hover:scale-110 group"
        title="Get AI movie/series suggestion"
        aria-label="Get AI movie/series suggestion"
      >
        <Sparkles className="text-lg text-theme-primary group-hover:animate-pulse transition-colors" />
      </button>

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={isSuggestionModalOpen}
        onClose={() => setIsSuggestionModalOpen(false)}
      />
    </>
  );
};

export default AiSuggestionLink;
