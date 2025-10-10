import React from "react";
import MediaCard from "../display/MediaCard";
import ResponsiveGrid from "../layout/ResponsiveGrid";
import PaginationWrapper from "../layout/PaginationWrapper";
import { TMDBTVShow } from "@/lib/types";

interface TvDisplayProps {
  series?: TMDBTVShow[];
  pageid?: string | number;
  totalPages?: number;
}

const TvDisplay = ({ series, pageid, totalPages = 500 }: TvDisplayProps) => {
  // Use base URL with query params for pagination
  const baseUrl = `/series`;
  
  return (
    <>
      <ResponsiveGrid>
        {(series ?? []).map((serie) => (
          <MediaCard 
            key={serie.id} 
            media={serie} 
            variant="grid"
          />
        ))}
      </ResponsiveGrid>
      
      <PaginationWrapper 
        pageid={pageid}
        baseUrl={baseUrl}
        maxPage={totalPages}
      />
    </>
  );
};

export default TvDisplay;
