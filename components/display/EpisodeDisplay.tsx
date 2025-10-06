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
    <>
      <h1 className="text-white text-xl sm:text-2xl text-center my-2">
        All Episodes
      </h1>
      <div className="w-full flex justify-center mt-3 mb-6">
        <span className="w-4/5 bg-grey h-0.5"></span>
      </div>
      <div className="flex flex-wrap justify-center py-1 px-5">
        {EpisodeInfos.map((episode) => {
          return (
            <EpisodeCard
              key={`${episode.season_number}-${episode.episode_number}`}
              episodeinfo={episode}
              seriesId={seriesId}
            />
          );
        })}      </div>
    </>
  );
};

export default EpisodeDisplay;
