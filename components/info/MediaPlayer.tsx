'use client';

import React from 'react';

interface MediaPlayerProps {
  seriesId: string | number;
  seasonNumber: number;
  episodeNumber: number;
  episodeTitle?: string;
  className?: string;
}

/**
 * MediaPlayer - Simple video player component with security and accessibility features
 */
const MediaPlayer: React.FC<MediaPlayerProps> = ({
  seriesId,
  seasonNumber,
  episodeNumber,
  episodeTitle,
  className = ""
}) => {
  // Validate props before rendering
  const seriesIdString = String(seriesId).trim();
  const seasonNum = Number(seasonNumber);
  const episodeNum = Number(episodeNumber);

  // Validation checks
  if (!seriesIdString) {
    return (
      <div className={`${className} glass-container p-4`}>
        <div className="text-red-400 text-center">
          <p>Error: Series ID is required</p>
        </div>
      </div>
    );
  }

  if (!Number.isInteger(seasonNum) || seasonNum <= 0) {
    return (
      <div className={`${className} glass-container p-4`}>
        <div className="text-red-400 text-center">
          <p>Error: Season number must be a positive integer</p>
        </div>
      </div>
    );
  }

  if (!Number.isInteger(episodeNum) || episodeNum <= 0) {
    return (
      <div className={`${className} glass-container p-4`}>
        <div className="text-red-400 text-center">
          <p>Error: Episode number must be a positive integer</p>
        </div>
      </div>
    );
  }

  // Sanitize and encode values for URL construction
  const encodedSeriesId = encodeURIComponent(seriesIdString);
  const validSeasonNumber = seasonNum;
  const validEpisodeNumber = episodeNum;

  // Construct the iframe src URL with validated and encoded values
  const iframeSrc = `https://v2.vidsrc.me/embed/${encodedSeriesId}/${validSeasonNumber}-${validEpisodeNumber}`;
  
  // Create descriptive title for accessibility
  const iframeTitle = episodeTitle 
    ? `Video player for ${episodeTitle} - Season ${validSeasonNumber}, Episode ${validEpisodeNumber}`
    : `Video player - Season ${validSeasonNumber}, Episode ${validEpisodeNumber}`;

  return (
    <div className={`${className}`}>
      {/* Video Player Container */}
      <div className="glass-container p-0 overflow-hidden">
        <iframe
          className="w-4/5 aspect-video sm:pr-4 sm:pl-4 mx-auto block border-0"
          src={iframeSrc}
          title={iframeTitle}
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          referrerPolicy="no-referrer"
          allowFullScreen={true}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default MediaPlayer;