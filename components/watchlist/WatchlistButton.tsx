"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useWatchlist } from "@/lib/useWatchlist";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";

interface WatchlistButtonProps {
  media: TMDBMovie | TMDBTVShow;
  variant?: "default" | "compact" | "hero";
  className?: string;
}

// Type guard function
function isTVShow(item: TMDBMovie | TMDBTVShow): item is TMDBTVShow {
  return "first_air_date" in item && item.first_air_date !== undefined;
}

/**
 * WatchlistButton - Reusable component for adding/removing items from watchlist
 * Supports multiple variants for different UI contexts
 */
const WatchlistButton = ({
  media,
  variant = "default",
  className = "",
}: WatchlistButtonProps) => {
  const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useWatchlist();

  const isTV = isTVShow(media);
  const mediaType = isTV ? "tv" : "movie";
  const inWatchlist = isInWatchlist(media.id, mediaType);

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (inWatchlist) {
      removeFromWatchlist(media.id, mediaType);
    } else {
      addToWatchlist(media);
    }
  };

  // Variant-specific styling
  const getButtonStyles = () => {
    const baseTransition = "transition-all duration-200";

    switch (variant) {
      case "compact":
        return `p-2 h-9 w-9 rounded-xl ${baseTransition} ${
          inWatchlist
            ? "text-theme-primary bg-theme-primary/10 hover:bg-theme-primary/20 border border-theme-primary/30 backdrop-blur-md"
            : "text-white hover:bg-white/20 backdrop-blur-md border border-white/30"
        }`;

      case "hero":
        return `px-6 py-2 ${baseTransition} ${
          inWatchlist
            ? "text-theme-primary bg-theme-primary/10 hover:bg-theme-primary/20 border border-theme-primary/30"
            : "text-white hover:bg-white/20 hover:text-black"
        }`;

      default:
        return `px-4 py-2 ${baseTransition} ${
          inWatchlist
            ? "text-theme-primary bg-theme-primary/10 hover:bg-theme-primary/20 border border-theme-primary/30"
            : "text-white hover:bg-white/20 border border-white/30"
        }`;
    }
  };

  const getSize = () => {
    switch (variant) {
      case "compact":
        return "sm";
      case "hero":
        return "default";
      default:
        return "default";
    }
  };

  const getContent = () => {
    if (variant === "compact") {
      return inWatchlist ? (
        <Check className="h-4 w-4" />
      ) : (
        <Plus className="h-4 w-4" />
      );
    }

    return inWatchlist ? (
      <>
        <Check className="mr-2 h-4 w-4" />
        In Watchlist
      </>
    ) : (
      <>
        <Plus className="mr-2 h-4 w-4" />
        Watchlist
      </>
    );
  };

  return (
    <Button
      size={getSize()}
      variant="ghost"
      className={`${getButtonStyles()} ${className}`}
      onClick={handleToggle}
      aria-pressed={inWatchlist}
      aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      {getContent()}
    </Button>
  );
};

export default WatchlistButton;
