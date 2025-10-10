import React from "react";

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  air_date?: string;
  overview?: string;
  runtime?: number;
}

interface SeasonInfo {
  id: number;
  name: string;
  air_date?: string;
  overview?: string;
  poster_path?: string;
  season_number: number;
  episodes: Episode[];
}

interface SeasonDetailsProps {
  SeasonInfos?: SeasonInfo;
}

const SeasonDetails = ({ SeasonInfos }: SeasonDetailsProps) => {
  
  // Early guard: return placeholder if SeasonInfos is missing
  if (!SeasonInfos) {
    return (
      <div className="text-white flex flex-col items-center sm:items-start w-full sm:w-3/5 ml-0 sm:ml-4 px-7 sm:px-5">
        <h1 className="text-2xl sm:text-3xl text-center sm:text-left">
          Season information not available
        </h1>
        <p className="text-light-white mt-5 text-justify text-base sm:text-lg">
          No season details to display.
        </p>
      </div>
    );
  }

  // Defensive data extraction with defaults
  const episodes = SeasonInfos?.episodes ?? [];
  const seasonName = SeasonInfos?.name ?? 'Unknown Season';
  const airDate = SeasonInfos?.air_date;
  const overview = SeasonInfos?.overview ?? 'No overview available';
  
  return (
    <div className="text-white flex flex-col items-center sm:items-start w-full sm:w-3/5 ml-0 sm:ml-4 px-7 sm:px-5">
      <h1 className="text-2xl sm:text-3xl  text-center sm:text-left">
        {seasonName}
      </h1>

      <div className="flex flex-wrap justify-center mt-4 w-fit text-sm sm:text-base">
        <div className="flex space-x-5">
          <span>{airDate ? airDate.slice(0, 4) : 'Unknown Year'}</span>
          <span>{episodes.length} Episodes</span>
        </div>
      </div>

      <p className="text-light-white mt-5 text-justify text-base sm:text-lg">{overview}</p>
    </div>
  );
};

export default SeasonDetails;
