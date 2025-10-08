import React from 'react';
import { Star, Calendar, Clock, Users, Tv, Film, Play, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaMetaProps {
  type: 'movie' | 'tv';
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
  // Watch controls props
  watchControls?: {
    isWatched: boolean;
    hasProgress: boolean;
    onMarkWatched: () => void;
    onStartOver: () => void;
  };
}

/**
 * MediaMeta - Modern metadata component for movies and TV shows
 * Features responsive design with beautiful icons and glass morphism
 */
const MediaMeta: React.FC<MediaMetaProps> = ({
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
  watchControls,
  className = ""
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="glass-container space-y-4 relative">
        {/* Watch Controls - Top Right Corner */}
        {watchControls && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex flex-col gap-2">
              {watchControls.isWatched ? (
                <Button
                  onClick={watchControls.onStartOver}
                  size="sm"
                  className="bg-gray-600/80 hover:bg-gray-500/80 text-white border border-gray-500/50 
                           smooth-transition hover:scale-105 group text-xs px-3 py-1.5"
                >
                  <RotateCcw className="w-3 h-3 mr-1 group-hover:rotate-180 smooth-transition" />
                  Start Over
                </Button>
              ) : watchControls.hasProgress ? (
                <>
                  <Button
                    onClick={watchControls.onMarkWatched}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-black font-semibold 
                             smooth-transition hover:scale-105 group text-xs px-3 py-1.5"
                  >
                    <Check className="w-3 h-3 mr-1 group-hover:scale-110 smooth-transition" />
                    Watched
                  </Button>
                  <Button
                    onClick={watchControls.onStartOver}
                    size="sm"
                    variant="outline"
                    className="border-gray-500/50 text-gray-300 hover:text-white hover:bg-gray-600/50 
                             smooth-transition hover:scale-105 text-xs px-3 py-1.5"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restart
                  </Button>
                </>
              ) : (
                <Button
                  onClick={watchControls.onMarkWatched}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-black font-semibold 
                           smooth-transition hover:scale-105 group text-xs px-3 py-1.5"
                >
                  <Play className="w-3 h-3 mr-1 group-hover:translate-x-0.5 smooth-transition" />
                  Mark Watched
                </Button>
              )}
              
              {/* Progress indicator */}
              <div className="text-xs text-center">
                {watchControls.isWatched ? (
                  <span className="flex items-center justify-center gap-1 text-green-400">
                    <Check className="w-3 h-3" />
                    Done
                  </span>
                ) : watchControls.hasProgress ? (
                  <span className="text-primary">In Progress</span>
                ) : (
                  <span className="text-gray-400">Not Started</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Media Type Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 
                        rounded-full text-xs font-semibold border border-primary/30">
            {type === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            {type === 'movie' ? 'Movie' : 'TV Series'}
          </div>
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
          
          {type === 'movie' && runtime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium">{runtime} min</span>
            </div>
          )}
          
          {type === 'tv' && seasons && (
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-primary" />
              <span className="font-medium">{seasons} Season{seasons !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {type === 'tv' && episodes && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-medium">{episodes} Episode{episodes !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {rating && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-bold text-white">{rating.toFixed(1)}</span>
              {ratingCount && (
                <span className="text-sm text-gray-400">({ratingCount.toLocaleString()})</span>
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
            <p className="text-gray-300 leading-relaxed text-sm">
              {overview}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaMeta;