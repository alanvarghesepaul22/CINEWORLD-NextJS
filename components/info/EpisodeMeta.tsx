import React from 'react';
import { Calendar, Clock, Play, Tv } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface EpisodeMetaProps {
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle?: string;
  airDate?: string;
  runtime?: number | null;
  overview?: string;
  seriesTitle?: string;
  className?: string;
}

/**
 * EpisodeMeta - Modern episode metadata component with glass morphism design
 * Features responsive layout and beautiful typography
 */
const EpisodeMeta: React.FC<EpisodeMetaProps> = ({
  seasonNumber,
  episodeNumber,
  episodeTitle,
  airDate,
  runtime,
  overview,
  seriesTitle,
  className = ""
}) => {
  // Use the centralized date formatting utility with long month format
  const formattedDate = formatDate(airDate, undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="glass-container space-y-4">
        {/* Series Title */}
        {seriesTitle && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Tv className="w-4 h-4" />
            <span>{seriesTitle}</span>
          </div>
        )}

        {/* Episode Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/20 text-primary px-3 py-1.5 
                        rounded-full text-xs font-semibold border border-primary/30">
            <Play className="w-3 h-3" />
            Episode S{seasonNumber}E{episodeNumber}
          </div>
        </div>

        {/* Episode Title */}
        <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight">
          {episodeTitle || `Episode ${episodeNumber}`}
        </h1>

        {/* Episode Stats */}
        <div className="flex flex-wrap items-center gap-4 text-gray-300">
          {formattedDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">{formattedDate}</span>
            </div>
          )}
          
          {runtime && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">{runtime} min</span>
            </div>
          )}
        </div>

        {/* Episode Overview */}
        {overview && (
          <div className="pt-2">
            <h3 className="text-lg font-semibold text-white mb-3">Synopsis</h3>
            <p className="text-gray-300 leading-relaxed text-sm lg:text-base">
              {overview}
            </p>
          </div>
        )}

        {/* Episode Progress Indicator */}
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Season {seasonNumber} • Episode {episodeNumber}</span>
            </div>
            <div className="text-xs text-gray-500">
              HD Quality Available
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeMeta;