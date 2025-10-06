import React from "react";
import EpisodeDetails from "./EpisodeDetails";
import NextEpisode from "../pagination/NextEpisode";
import { EpisodeSummary } from "@/lib/types";

interface EpisodeInfoProps {
  episodeDetails: {
    season_number: number;
    episode_number: number;
  };
  seriesId: string | number;
  seasonData: {
    episodes: EpisodeSummary[];
  };
  seriesData: {
    number_of_seasons: number;
  };
}

const EpisodeInfo = (props: EpisodeInfoProps) => {
  let { episodeDetails, seriesId, seasonData, seriesData } = props;
  let TotalEpisodes = seasonData?.episodes?.length ?? 0;
  let TotalSeasons = seriesData?.number_of_seasons ?? 0;

  // Find the full episode details from seasonData.episodes
  const fullEpisodeDetails =
    seasonData?.episodes?.find(
      (ep: EpisodeSummary) =>
        ep.season_number === episodeDetails.season_number &&
        ep.episode_number === episodeDetails.episode_number
    ) ?? {
      ...episodeDetails,
      name: "",
      air_date: "",
      runtime: 0,
      overview: "",
    };

  return (
    <div>
      <div className="flex flex-row place-content-center items-center mb-10 mt-5">
        <EpisodeDetails episodeDetails={fullEpisodeDetails} />
      </div>
      <div className="pt-2 pb-8 flex justify-center">
        <iframe
          className="w-4/5 aspect-video sm:px-4"
          src={`https://v2.vidsrc.me/embed/${seriesId}/${episodeDetails.season_number}-${episodeDetails.episode_number}`}
          allowFullScreen={true}
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          loading="lazy"
          title="Episode Video Player"
        ></iframe>{" "}
        {/* https://vidsrc.to/embed/tv/${seriesId}/${episodeDetails.season_number}/${episodeDetails.episode_number} */}
        {/* https://v2.vidsrc.me/embed/${seriesId}/${episodeDetails.season_number}-${episodeDetails.episode_number} */}
        {/* not working */}
        {/* https://olgply.xyz/${seriesId}/${episodeDetails.season_number}/${episodeDetails.episode_number} */}
        {/* src={`https://autoembed.to/tv/tmdb/${seriesId}-${episodeDetails.season_number}-${episodeDetails.episode_number}`} */}
      </div>
      <div className="flex w-full items-center justify-center">
        <NextEpisode
          seriesId={seriesId}
          episodeDetails={episodeDetails}
          totalEpisodes={TotalEpisodes}
          totalSeasons={TotalSeasons}
        />
      </div>
    </div>
  );
};

export default EpisodeInfo;
