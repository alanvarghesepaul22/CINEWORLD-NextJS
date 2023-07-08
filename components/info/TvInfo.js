import React from "react";
import ImageCard from "../display/ImageCard";
import TvDetails from "./TvDetails";
import SeasonDisplay from "../display/SeasonDisplay";

const TvInfo = (props) => {
  let {TvDetail,genreArr,id}=props
  let seasons=TvDetail.seasons
  
  return (
    <div>
      <div className="flex flex-row flex-wrap place-content-center items-center mb-10 mt-5">
        <ImageCard MovieDetail={TvDetail} />
        <TvDetails TvDetail={TvDetail} genreArr={genreArr} SeasonNums={TvDetail.number_of_seasons} EpisodeNums={TvDetail.number_of_episodes} />
      </div>

      <div>
        <SeasonDisplay key={TvDetail.id} SeasonCards={seasons} TvDetails={TvDetail}/>
      </div>
    </div>
  );
};

export default TvInfo;
