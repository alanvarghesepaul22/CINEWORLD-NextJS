import React from "react";
import {
  Star,
  Calendar,
  Clock,
  Users,
  Tv,
  Film,
} from "lucide-react";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";

interface MediaMetaProps {
  type: "movie" | "tv";
  title: string;
  year?: string;
  rating?: number;
  ratingCount?: number;
  runtime?: number | null;
  seasons?: number;
  episodes?: number;
  genres: string[];
  overview?: string;
  className?: string;
  // Media data for watchlist functionality
  media: TMDBMovie | TMDBTVShow;
}

/**
 * MediaMeta - Modern metadata component for movies and TV shows
 * Features responsive design with beautiful icons and glass morphism
 */
const MediaMeta= ({
  type,
  title,
  year,
  rating,
  ratingCount,
  runtime,
  seasons,
  episodes,
  genres,
  overview,
  media,
  className = "",
}: MediaMetaProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="glass-container space-y-4 relative">
        {/* Media Type Badge and Watchlist Button */}
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 
                        rounded-full text-xs font-semibold border border-primary/30"
          >
            {type === "movie" ? (
              <Film className="w-4 h-4" />
            ) : (
              <Tv className="w-4 h-4" />
            )}
            {type === "movie" ? "Movie" : "TV Series"}
          </div>
          
          <WatchlistButton media={media} variant="default" />
        </div>

        {/* Title */}
        <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
          {title}
        </h1>

        {/* Quick Stats Row */}
        <div className="flex flex-wrap items-center gap-4 text-gray-300">
          {year && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">{year}</span>
            </div>
          )}

          {type === "movie" && runtime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">{runtime} min</span>
            </div>
          )}

          {type === "tv" && seasons && (
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {seasons} Season{seasons !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {type === "tv" && episodes && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">
                {episodes} Episode{episodes !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {rating && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-bold text-white">{rating.toFixed(1)}</span>
              {ratingCount && (
                <span className="text-sm text-gray-400">
                  ({ratingCount.toLocaleString()})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="pt-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 
                           rounded-full text-xs font-medium smooth-transition hover:bg-primary/20 
                           hover:scale-105"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Overview */}
        {overview && (
          <div className="pt-2">
            <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
            <p className="text-gray-300 leading-relaxed text-sm">{overview}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaMeta;
