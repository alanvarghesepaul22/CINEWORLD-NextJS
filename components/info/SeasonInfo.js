import React from "react";
import ImageCard from "../display/ImageCard";
import SeasonDetails from "./SeasonDetails";
import EpisodeDisplay from "../display/EpisodeDisplay";

const SeasonInfo = (props) => {
  let {SeasonInfos,id}=props;
  let episodes = SeasonInfos.episodes;
  return (
    <div>
      <div className="flex flex-row flex-wrap place-content-center items-center mb-10 mt-5">
        <ImageCard MovieDetail={SeasonInfos} />
        <SeasonDetails SeasonInfos={SeasonInfos} />
      </div>

      <div>
        <EpisodeDisplay EpisodeInfos={episodes} seriesId={id} />
      </div>
    </div>
  );
};

export default SeasonInfo;
