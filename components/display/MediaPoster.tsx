import React from 'react';
import Image from 'next/image';

interface MediaPosterProps {
  posterPath: string | null;
  title: string;
  alt?: string;
  className?: string;
}

/**
 * MediaPoster - A modern, responsive poster component with glass morphism effects
 * Optimized for both movie and TV show posters with fallback support
 */
const MediaPoster: React.FC<MediaPosterProps> = ({ 
  posterPath, 
  title, 
  alt,
  className = "" 
}) => {
  const imageSrc = posterPath 
    ? `https://image.tmdb.org/t/p/w500/${posterPath}`
    : "https://i.imgur.com/wjVuAGb.png";

  const imageAlt = alt || `${title} poster`;

  return (
    <div className={`relative group ${className}`}>
      {/* Glass morphism container */}
      <div className="p-3 h-fit max-w-xs mx-auto">
        <div className="relative overflow-hidden rounded-xl">
          {/* Main poster image */}
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={300}
            height={450}
            className="w-full h-auto aspect-[2/3] object-cover smooth-transition 
                     group-hover:scale-105 rounded-lg shadow-2xl"
            priority
          />
          
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent 
                        to-transparent opacity-0 group-hover:opacity-100 smooth-transition 
                        rounded-lg" />
        </div>
      </div>
      
      {/* Decorative glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 
                    rounded-xl blur-xl opacity-0 group-hover:opacity-30 smooth-transition 
                    -z-10" />
    </div>
  );
};

export default MediaPoster;