import React from 'react';

interface MediaPlayerProps {
  mediaId: string | number;
  title: string;
  type?: 'movie' | 'tv';
  season?: number;
  episode?: number;
  className?: string;
}

/**
 * MediaPlayer - Modern, responsive video player component
 * Features glass morphism container with optimal aspect ratio
 */
const MediaPlayer: React.FC<MediaPlayerProps> = ({ 
  mediaId, 
  title, 
  type = 'movie',
  season,
  episode,
  className = "" 
}) => {
  // Construct embed URL with episode-specific parameters for TV shows
  const embedUrl = type === 'movie' 
    ? `https://v2.vidsrc.me/embed/${mediaId}`
    : season && episode
      ? `https://v2.vidsrc.me/embed/tv/${mediaId}/${season}/${episode}`
      : `https://v2.vidsrc.me/embed/tv/${mediaId}`;

  return (
    <div className={`glass-container p-4 lg:p-6 ${className}`}>
      <div className="relative">
        {/* Player Header */}
        <div className="mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">
            Watch {title}
            {type === 'tv' && season && episode && (
              <span className="text-primary ml-2 text-lg">
                S{season}E{episode}
              </span>
            )}
          </h2>
          <div className="w-full h-px bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        </div>

        {/* Video Container */}
        <div className="relative">
          {/* Responsive iframe container */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/50">
            <iframe
              src={embedUrl}
              title={`${title} - Video Player`}
              className="absolute inset-0 w-full h-full border-0 rounded-xl"
              allow="encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-presentation"
              allowFullScreen
              loading="lazy"
            />
          </div>
          
          {/* Decorative glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-blue-500/10 
                        to-primary/10 rounded-2xl blur-xl opacity-50 -z-10" />
        </div>

        {/* Player Footer */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Streaming in high quality • Auto-adjusts to your connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;