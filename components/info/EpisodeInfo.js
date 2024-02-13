import React from "react";
import EpisodeDetails from "./EpisodeDetails";
import NextEpisode from "../pagination/NextEpisode";

const EpisodeInfo = (props) => {
  let { episodeDetails, seriesId, seasonData, seriesData } = props;
  let TotalEpisodes = seasonData.episodes.length;
  let TotalSeasons = seriesData.number_of_seasons;
  return (
    <div>
      <div className="flex flex-row place-content-center items-center mb-10 mt-5">
        <EpisodeDetails episodeDetails={episodeDetails} />
      </div>
      <div className="pt-2 pb-8 flex justify-center">
        <iframe
          className="w-4/5 aspect-video sm: pr-4 pl-4"
          src={`https://v2.vidsrc.me/embed/${seriesId}/${episodeDetails.season_number}-${episodeDetails.episode_number}`}
          frameBorder={`0`}
          allowFullScreen={true}
        ></iframe>
        {/* working */}
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
