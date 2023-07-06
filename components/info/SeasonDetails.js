import React from "react";

const SeasonDetails = (props) => {
  let { SeasonInfos } = props;
  let episodes = SeasonInfos.episodes;
  return (
    <div className="text-white text-left w-3/5 ml-8">
      <h1 className="text-3xl">{SeasonInfos.name}</h1>
      <div className="flex justify-between mt-4 w-1/5">
        <span>{SeasonInfos.air_date.substr(0, 4)}</span>
        <span>{episodes.length} Episodes</span>
      </div>
      <p className="text-light-white mt-5">{SeasonInfos.overview}</p>
    </div>
  );
};

export default SeasonDetails;
