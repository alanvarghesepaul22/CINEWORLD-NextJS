import React from "react";
import SeasonCard from "./SeasonCard";

const SeasonDisplay = (props) => {
  let { SeasonCards, TvDetails } = props;
  return (
    <div className="flex flex-wrap justify-center p-10">
      {SeasonCards.map((season,index)=>{
        return(
           <SeasonCard key={index} SeasonDetails={season} SeriesId={TvDetails.id}/>
        )
       
      })}
      
    </div>
  );
};

export default SeasonDisplay;
