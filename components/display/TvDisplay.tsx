import React from "react";
import TvCards from "./TvCards";
import GenericPagination from "../pagination/GenericPagination";
import { TMDBTVShow } from "@/lib/types";

interface TvDisplayProps {
  series?: TMDBTVShow[];
  pageid?: string | number;
  category?: string; // e.g., "popular", "top-rated", "trending", "on-the-air"
}

const TvDisplay: React.FC<TvDisplayProps> = ({ series, pageid, category = "trending" }) => {
  // Construct the base URL for pagination
  const baseUrl = `/series/${category}`;
  
  return (
    <>
      <div className="flex flex-wrap justify-center py-10 px-5">
        {
          (series ?? []).map((serie) => <TvCards key={serie.id} seriesData={serie} />)
        }
      </div>
      {pageid != null && (
        <GenericPagination 
          currentPage={pageid} 
          baseUrl={baseUrl}
          maxPage={500} // TMDB API limit
        />
      )}
    </>
  );
};

export default TvDisplay;
