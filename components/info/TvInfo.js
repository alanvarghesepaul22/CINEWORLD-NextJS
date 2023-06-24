import React from "react";
import ImageCard from "../display/ImageCard";
import TvDetails from "./TvDetails";
import SeasonDisplay from "../display/SeasonDisplay";

const TvInfo = (props) => {
  let {TvDetail,genreArr,id}=props
  return (
    <div>
      <div className="flex flex-row place-content-center items-center mb-10 mt-5">
        <ImageCard MovieDetail={TvDetail} />
        <TvDetails TvDetail={TvDetail} genreArr={genreArr} />
      </div>

      <div>
        <SeasonDisplay/>
      </div>
    </div>
  );
};

export default TvInfo;
