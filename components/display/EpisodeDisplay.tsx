import React from "react";
import EpisodeCard from "./EpisodeCard";

interface EpisodeDisplayProps {
  EpisodeInfos: Array<{
    still_path: string | null;
    season_number: number;
    episode_number: number;
    name: string;
    overview: string;
    air_date: string;
  }>;
  seriesId: string;
}

const EpisodeDisplay: React.FC<EpisodeDisplayProps> = ({ EpisodeInfos, seriesId }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-2 sm:space-y-3 px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          All Episodes
        </h2>
        <div className="w-16 sm:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-blue-500 rounded-full mx-auto"></div>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-4">
        {EpisodeInfos.map((episode) => (
          <EpisodeCard
            key={`${episode.season_number}-${episode.episode_number}`}
            episodeinfo={episode}
            seriesId={seriesId}
          />
        ))}
      </div>
    </div>
  );
};

export default EpisodeDisplay;
