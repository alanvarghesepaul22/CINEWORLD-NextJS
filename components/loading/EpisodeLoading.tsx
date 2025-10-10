import { Loader2, Monitor } from "lucide-react";

interface EpisodeLoadingProps {
  className?: string;
}

/**
 * EpisodeLoading - Loading state component for episode pages
 * Features skeleton loading with glass morphism design
 */
const EpisodeLoading = ({ className = "" }: EpisodeLoadingProps) => {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-black via-gray-900 to-black ${className}`}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Episode Meta Loading */}
          <div className="glass-container space-y-4">
            <div className="animate-pulse">
              {/* Series title skeleton */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-gray-600/50 rounded" />
                <div className="h-4 bg-gray-600/50 rounded w-32" />
              </div>

              {/* Episode badge skeleton */}
              <div className="w-24 h-6 bg-primary/20 rounded-full mb-4" />

              {/* Title skeleton */}
              <div className="space-y-2 mb-6">
                <div className="h-8 bg-gray-600/50 rounded w-3/4" />
                <div className="h-8 bg-gray-600/50 rounded w-1/2" />
              </div>

              {/* Stats skeleton */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600/50 rounded" />
                  <div className="h-4 bg-gray-600/50 rounded w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600/50 rounded" />
                  <div className="h-4 bg-gray-600/50 rounded w-16" />
                </div>
              </div>

              {/* Overview skeleton */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-600/50 rounded w-20 mb-3" />
                <div className="h-4 bg-gray-600/50 rounded w-full" />
                <div className="h-4 bg-gray-600/50 rounded w-4/5" />
                <div className="h-4 bg-gray-600/50 rounded w-3/5" />
              </div>
            </div>
          </div>

          {/* Media Player Loading */}
          <div className="space-y-4">
            {/* Player Header */}
            <div className="glass-container">
              <div className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Monitor className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div className="h-5 bg-gray-600/50 rounded w-24 mb-1" />
                  <div className="h-4 bg-gray-600/50 rounded w-32" />
                </div>
                <div className="h-6 bg-gray-600/50 rounded w-20" />
              </div>
            </div>

            {/* Video Player Container */}
            <div className="glass-container p-0 overflow-hidden">
              <div className="aspect-video bg-gray-900/80 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-gray-300">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <span className="text-lg font-medium">
                    Loading Episode...
                  </span>
                  <span className="text-sm opacity-75">
                    Preparing video player
                  </span>
                </div>
              </div>

              {/* Player info skeleton */}
              <div className="p-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between animate-pulse">
                  <div className="h-4 bg-gray-600/50 rounded w-16" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-600/50 rounded-full" />
                    <div className="h-4 bg-gray-600/50 rounded w-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stream Info Loading */}
            <div className="glass-container">
              <div className="text-center space-y-2 animate-pulse">
                <div className="h-5 bg-gray-600/50 rounded w-32 mx-auto mb-2" />
                <div className="flex items-center justify-center gap-4">
                  <div className="h-3 bg-gray-600/50 rounded w-16" />
                  <div className="h-3 bg-gray-600/50 rounded w-20" />
                  <div className="h-3 bg-gray-600/50 rounded w-24" />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Loading */}
          <div className="glass-container">
            <div className="space-y-4 animate-pulse">
              {/* Header */}
              <div className="text-center">
                <div className="h-6 bg-gray-600/50 rounded w-40 mx-auto mb-2" />
                <div className="h-4 bg-gray-600/50 rounded w-48 mx-auto" />
              </div>

              <div className="w-full h-px bg-gray-700/50" />

              {/* Navigation buttons */}
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gray-600/30 rounded border border-gray-600/30" />
                <div className="h-12 bg-primary/20 rounded border border-primary/40" />
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-600/50 rounded w-20" />
                  <div className="h-3 bg-gray-600/50 rounded w-12" />
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div className="bg-primary/50 h-2 rounded-full w-1/3 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Did You Know Loading */}
          <div className="glass-container max-w-6xl mx-auto">
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-full">
                  <div className="w-5 h-5 bg-primary/50 rounded" />
                </div>
                <div className="h-6 bg-gray-600/50 rounded w-32" />
              </div>

              <div className="w-full h-px bg-gray-700/50" />

              <div className="space-y-3">
                <div className="h-4 bg-gray-600/50 rounded w-full" />
                <div className="h-4 bg-gray-600/50 rounded w-4/5" />
                <div className="h-4 bg-gray-600/50 rounded w-3/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeLoading;
