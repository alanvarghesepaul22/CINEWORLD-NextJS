import React from "react";
import EpisodeDetails from "./EpisodeDetails";

const EpisodeInfo = (props) => {
  let { episodeDetails, seriesId } = props;
  return (
    <div>
      <div className="flex flex-row place-content-center items-center mb-10 mt-5">
        <EpisodeDetails episodeDetails={episodeDetails} />
      </div>
      <div className="pt-2 pb-8 flex justify-center">
        <iframe
          className="w-4/5 aspect-video sm: pr-4 pl-4"
          src={`https://autoembed.to/tv/tmdb/${seriesId}-${episodeDetails.season_number}-${episodeDetails.episode_number}`}
          frameBorder={`0`}
          allowFullScreen={true}
        ></iframe>
      </div>
    </div>
  );
};

export default EpisodeInfo;
