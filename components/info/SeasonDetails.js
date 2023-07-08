import React from "react";

const SeasonDetails = (props) => {
  let { SeasonInfos } = props;
  let episodes = SeasonInfos.episodes;
  return (
    <div className="text-white flex flex-col items-center sm:items-start w-full sm:w-3/5 ml-0 sm:ml-4 px-7 sm:px-5">
      <h1 className="text-2xl sm:text-3xl  text-center sm:text-left">
        {SeasonInfos.name}
      </h1>

      <div className="flex flex-wrap justify-center mt-4 w-fit text-sm sm:text-base">
        <div className="flex space-x-5">
          <span>{SeasonInfos.air_date.substr(0, 4)}</span>
          <span>{episodes.length} Episodes</span>
        </div>
      </div>

      <p className="text-light-white mt-5 text-justify text-base sm:text-lg">{SeasonInfos.overview}</p>
    </div>
  );
};

export default SeasonDetails;
