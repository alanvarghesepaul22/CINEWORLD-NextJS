import React from 'react';

interface MediaDetailLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MediaDetailLayout - A modern, responsive layout container for media detail pages
 * Features glass morphism design with optimal spacing and mobile-first approach
 */
const MediaDetailLayout: React.FC<MediaDetailLayoutProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black ${className}`}>
      {/* Background overlay for better content readability */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MediaDetailLayout;