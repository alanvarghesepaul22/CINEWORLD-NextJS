import React from "react";
import TvCards from "./TvCards";
import TvPagination from "../pagination/TvPagination";

const TvDisplay = (props) => {
  let { series, pageid} = props;
  return (
    <>
      <div className="flex flex-wrap justify-center py-10 px-5">
        {
          series.map((serie)=>{
            return <TvCards key={serie.id} TvCard={serie} />
          })
        }
      </div>
      <TvPagination pageid={pageid} />
    </>
  );
};

export default TvDisplay;
