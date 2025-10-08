"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { useWatchlist } from "@/lib/useWatchlist";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";

// Type guard function using a reliable discriminant
function isTVShow(item: TMDBMovie | TMDBTVShow): item is TMDBTVShow {
  return "first_air_date" in item && item.first_air_date !== undefined;
}

interface MediaCardProps {
  media: TMDBMovie | TMDBTVShow;
  variant?: "horizontal" | "grid"; // For different layouts
  className?: string;
}

const MediaCard: React.FC<MediaCardProps> = ({
  media,
  variant = "grid",
  className = "",
}) => {
  const { addToWatchlist, isInWatchlist, removeFromWatchlist } = useWatchlist();

  const isTV = isTVShow(media);
  const href = isTV ? `/series/${media.id}` : `/movie/${media.id}`;
  const titleVal = isTV ? media.name : media.title;

  const poster_path = media.poster_path
    ? `https://image.tmdb.org/t/p/w342/${media.poster_path}`
    : "https://i.imgur.com/wjVuAGb.png";

  const inWatchlist = isInWatchlist(media.id);

  // Dynamic classes based on variant
  const getCardClasses = () => {
    const baseClasses =
      "group relative rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1";
    const premiumEffects =
      "bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/80";

    if (variant === "horizontal") {
      // For horizontal scrolling (CategorySection)
      return `w-[160px] sm:w-[180px] md:w-[200px] ${baseClasses} ${premiumEffects} ${className}`;
    } else {
      // For grid layout (MovieDisplay, TvDisplay) - responsive sizing
      return `w-full ${baseClasses} ${premiumEffects} ${className}`;
    }
  };

  // Simple toggle button for watchlist - Hero section style
  const renderActionButtons = () => {
    return (
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-30">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (inWatchlist) {
              removeFromWatchlist(media.id);
            } else {
              addToWatchlist(media);
            }
          }}
          className={`p-2 h-9 w-9 rounded-xl smooth-transition ${
            inWatchlist
              ? "text-theme-primary bg-theme-primary/10 hover:bg-theme-primary/20 border border-theme-primary/30 backdrop-blur-md"
              : "text-white hover:bg-white/20 backdrop-blur-md border border-white/30"
          }`}
          aria-label={
            inWatchlist ? "Remove from watchlist" : "Add to watchlist"
          }
        >
          {inWatchlist ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className={getCardClasses()}>
      <Link href={href} title={titleVal} className="block w-full">
        <div className="aspect-[2/3] w-full relative overflow-hidden">
          {/* Premium image container with enhanced effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <Image
            src={poster_path}
            alt={`${titleVal} ${isTV ? "TV series" : "movie"} poster`}
            width={342}
            height={513}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
            unoptimized
          />

          {/* Premium overlay content */}
          <div className="absolute inset-0 z-20">
            {/* Rating badge */}
            {media.vote_average > 0 && (
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-yellow-500/30">
                  <span className="text-yellow-400 text-xs font-bold">
                    ⭐ {media.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            {/* Movie/Series info on hover - bottom left */}
            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="space-y-1">
                {/* Media type badge */}
                <div className="w-fit bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-md px-1 py-1 rounded-lg border border-blue-500/30">
                  <span className="text-white text-xs uppercase tracking-wider">
                    {isTV ? "Series" : "Movie"}
                  </span>
                </div>
                {/* Title */}
                <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-gray-600/30">
                  <h3 className="text-white text-xs font-semibold line-clamp-2 leading-tight">
                    {titleVal}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Action buttons with premium styling - Outside Link component for proper z-index */}
      {renderActionButtons()}
    </div>
  );
};

export default MediaCard;
