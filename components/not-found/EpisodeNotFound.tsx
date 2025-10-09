import Link from "next/link";
import React from "react";

interface EpisodeNotFoundProps {
  seriesId: string;
  seasonId: string;
  episodeId: string;
}

export default function EpisodeNotFound({
  seriesId,
  seasonId,
  episodeId,
}: EpisodeNotFoundProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="glass-container text-center max-w-lg">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-400">404</h1>
        <h1 className="text-2xl font-bold text-white mb-4">
          Episode Not Found
        </h1>
        <p className="text-gray-300 mb-4">
          Could not find episode S{seasonId}E{episodeId} for this series.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>This could be due to:</p>
          <ul className="text-left space-y-1">
            <li>• Episode not yet released</li>
            <li>• Invalid episode number</li>
            <li>• Network connectivity issues</li>
            <li>• Temporary server problems</li>
          </ul>
        </div>
        <div className="mt-6">
          <Link
            href={`/series/${seriesId}/season/${seasonId}`}
            className="bg-primary hover:bg-primary/90 text-black font-semibold px-4 py-2 rounded smooth-transition inline-block"
          >
            Back to Season
          </Link>
        </div>
      </div>
    </div>
  );
}
