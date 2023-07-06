import React from "react";
import EpisodeCard from "./EpisodeCard";

const EpisodeDisplay = (props) => {
  let { EpisodeInfos, seriesId } = props;
  return (
    <div className="flex flex-wrap justify-center p-10">
      {EpisodeInfos.map((episode, index) => {
        return (
          <EpisodeCard key={index} episodeinfo={episode} seriesId={seriesId} />
        );
      })}
    </div>
  );
};

export default EpisodeDisplay;
