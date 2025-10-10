import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EpisodeNavigationProps {
  seriesId: string | number;
  currentSeason: number;
  currentEpisode: number;
  totalEpisodes: number;
  totalSeasons: number;
  className?: string;
}

/**
 * EpisodeNavigation - Modern navigation component for episodes with glass morphism design
 * Features smooth transitions, intelligent navigation logic, and robust data validation
 */
const EpisodeNavigation = ({
  seriesId,
  currentSeason,
  currentEpisode,
  totalEpisodes,
  totalSeasons,
  className = ""
}: EpisodeNavigationProps) => {
  // Validate input data to prevent crashes
  const validSeriesId = seriesId ? String(seriesId) : null;
  const validCurrentSeason = Math.max(1, Number(currentSeason) || 1);
  const validCurrentEpisode = Math.max(1, Number(currentEpisode) || 1);
  const validTotalEpisodes = Math.max(1, Number(totalEpisodes) || 1);
  const validTotalSeasons = Math.max(1, Number(totalSeasons) || 1);

  // Don't render if essential data is missing
  if (!validSeriesId || validCurrentSeason < 1 || validCurrentEpisode < 1) {
    return (
      <div className={`glass-container ${className}`}>
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-white mb-2">Navigation Unavailable</h3>
          <p className="text-sm text-gray-400">
            Episode navigation data is incomplete or invalid.
          </p>
        </div>
      </div>
    );
  }

  const isFirstEpisode = validCurrentEpisode === 1;
  const isLastEpisode = validCurrentEpisode >= validTotalEpisodes;
  const isFirstSeason = validCurrentSeason === 1;
  const isLastSeason = validCurrentSeason >= validTotalSeasons;

  const prevEpisodeNumber = Math.max(1, validCurrentEpisode - 1);
  const nextEpisodeNumber = Math.min(validTotalEpisodes, validCurrentEpisode + 1);
  const prevSeasonNumber = Math.max(1, validCurrentSeason - 1);
  const nextSeasonNumber = Math.min(validTotalSeasons, validCurrentSeason + 1);

  // Ensure navigation URLs are safe
  const createSafeUrl = (path: string) => {
    try {
      // Basic validation to prevent XSS or invalid URLs
      if (!path || typeof path !== 'string') return '#';
      
      // Remove any potentially dangerous characters
      const safePath = path.replace(/[<>'"]/g, '');
      return safePath;
    } catch {
      return '#';
    }
  };

  return (
    <div className={`glass-container ${className}`}>
      <div className="space-y-3">
        {/* Navigation Header */}
        <div className="text-center">
          <h3 className="text-base font-semibold text-white mb-1">Episode Navigation</h3>
          <p className="text-xs text-gray-400">
            Season {validCurrentSeason} • Episode {validCurrentEpisode} of {validTotalEpisodes}
          </p>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Previous Episode/Season */}
          {isFirstEpisode ? (
            // Previous Season Button
            isFirstSeason ? (
              <Button
                disabled
                className="w-full bg-gray-600/30 text-gray-500 cursor-not-allowed border border-gray-600/30 
                         h-8 flex items-center justify-center gap-1.5 text-xs"
              >
                <SkipBack className="w-3 h-3" />
                <span>No Previous</span>
              </Button>
            ) : (
              <Link
                href={createSafeUrl(`/series/${validSeriesId}/season/${prevSeasonNumber}`)}
                className="w-full"
              >
                <Button
                  className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 
                           smooth-transition hover:scale-105 h-8 flex items-center justify-center gap-1.5
                           hover:shadow-lg hover:shadow-primary/20 text-xs"
                >
                  <SkipBack className="w-3 h-3" />
                  <span>Prev Season</span>
                </Button>
              </Link>
            )
          ) : (
            // Previous Episode Button
            <Link
              href={createSafeUrl(`/series/${validSeriesId}/season/${validCurrentSeason}/${prevEpisodeNumber}`)}
              className="w-full"
            >
              <Button
                className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white border border-gray-600/50 
                         smooth-transition hover:scale-105 h-8 flex items-center justify-center gap-1.5
                         hover:shadow-lg hover:shadow-gray-500/20 text-xs"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Prev Episode</span>
              </Button>
            </Link>
          )}

          {/* Next Episode/Season */}
          {isLastEpisode ? (
            // Next Season Button
            isLastSeason ? (
              <Button
                disabled
                className="w-full bg-gray-600/30 text-gray-500 cursor-not-allowed border border-gray-600/30 
                         h-8 flex items-center justify-center gap-1.5 text-xs"
              >
                <span>Complete</span>
                <SkipForward className="w-3 h-3" />
              </Button>
            ) : (
              <Link
                href={createSafeUrl(`/series/${validSeriesId}/season/${nextSeasonNumber}`)}
                className="w-full"
              >
                <Button
                  className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 
                           smooth-transition hover:scale-105 h-8 flex items-center justify-center gap-1.5
                           hover:shadow-lg hover:shadow-primary/20 text-xs"
                >
                  <span>Next Season</span>
                  <SkipForward className="w-3 h-3" />
                </Button>
              </Link>
            )
          ) : (
            // Next Episode Button
            <Link
              href={createSafeUrl(`/series/${validSeriesId}/season/${validCurrentSeason}/${nextEpisodeNumber}`)}
              className="w-full"
            >
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-black font-semibold 
                         smooth-transition hover:scale-105 h-8 flex items-center justify-center gap-1.5
                         hover:shadow-lg hover:shadow-primary/30 text-xs"
              >
                <span>Next Episode</span>
                <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default EpisodeNavigation;