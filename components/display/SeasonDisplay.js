import React from "react";
import SeasonCard from "./SeasonCard";

const SeasonDisplay = (props) => {
  let { SeasonCards, TvDetails } = props;
  return (
    <>
      <h1 className="text-white text-xl sm:text-2xl text-center my-2">
        All Seasons
      </h1>
      <div className="w-full flex justify-center mt-3 mb-6">
          <span className="w-4/5 bg-grey h-0.5"></span>
      </div>
    
      <div className="flex flex-wrap justify-center py-1 px-5">
        {SeasonCards.map((season, index) => {
          return (
            <SeasonCard
              key={index}
              SeasonDetails={season}
              SeriesId={TvDetails.id}
            />
          );
        })}
      </div>
    </>
  );
};

export default SeasonDisplay;
