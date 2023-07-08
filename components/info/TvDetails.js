import React from "react";
import { AiTwotoneStar } from "react-icons/ai";

const TvDetails = (props) => {
  let { TvDetail, genreArr, SeasonNums, EpisodeNums } = props;

  return (
    <div className="text-white flex flex-col items-center sm:items-start w-full sm:w-3/5 ml-0 sm:ml-4 px-7 sm:px-5">
      <p className="w-fit bg-light-primary  text-black px-2 font-bold text-sm rounded-sm mb-2">
        TV
      </p>

      <h1 className="text-2xl sm:text-3xl text-center sm:text-left">
        {TvDetail.name}
      </h1>

      <div className="flex flex-wrap justify-center mt-4 w-fit text-sm sm:text-base">
        <div className="flex space-x-5">
          <span>{TvDetail.first_air_date.substr(0, 4)}</span>
          <span>{SeasonNums} Seasons</span>
        </div>
        <div className="flex space-x-5 mx-4">
          <span>{EpisodeNums} Episodes</span>
          <div className="flex items-center">
            <AiTwotoneStar className="text-primary mr-1" />
            <span>{TvDetail.vote_average.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center sm:justify-start w-fit my-3 space-x-3 text-sm sm:text-base">
        {genreArr.map((item, index) => {
          return (
            <p
              key={index}
              className="text-light-primary border border-light-primary px-3 rounded-full w-fit  my-1"
            >
              {item}
            </p>
          );
        })}
      </div>
      <p className="text-light-white mt-5 text-justify text-base sm:text-lg">
        {TvDetail.overview}
      </p>
    </div>
  );
};

export default TvDetails;
