import React from "react";
import EpisodeCard from "./EpisodeCard";

const EpisodeDisplay = (props) => {
  let { EpisodeInfos, seriesId } = props;
  return (
    <>
      <h1 className="text-white text-xl sm:text-2xl text-center my-2">
        All Episodes
      </h1>
      <div className="w-full flex justify-center mt-3 mb-6">
        <span className="w-4/5 bg-grey h-0.5"></span>
      </div>
      <div className="flex flex-wrap justify-center py-1 px-5">
        {EpisodeInfos.map((episode, index) => {
          return (
            <EpisodeCard
              key={index}
              episodeinfo={episode}
              seriesId={seriesId}
            />
          );
        })}
      </div>
    </>
  );
};

export default EpisodeDisplay;
