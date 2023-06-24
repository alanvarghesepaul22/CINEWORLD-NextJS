import React from "react";
import ImageCard from "../display/ImageCard";
import SeasonDetails from "./SeasonDetails";
import EpisodeDisplay from "../display/EpisodeDisplay";

const SeasonInfo = () => {
  return (
    <div>
      <div className="flex flex-row place-content-center items-center mb-10 mt-5">
        <ImageCard />
        <SeasonDetails />
      </div>

      <div>
        <EpisodeDisplay/>
      </div>
    </div>
  );
};

export default SeasonInfo;
