import React from "react";
import ImageCard from "../display/ImageCard";
import TvDetails from "./TvDetails";
import SeasonDisplay from "../display/SeasonDisplay";
import { TMDBTVDetail } from "@/lib/types";

interface TvInfoProps {
  tvDetail: TMDBTVDetail;
  genreArr: string[];
}

const TvInfo: React.FC<TvInfoProps> = (props) => {
  const { tvDetail, genreArr } = props;
  
  // Defensive extraction with safe defaults
  const seasons = tvDetail?.seasons ?? [];
  const seasonCount = tvDetail?.number_of_seasons ?? 0;
  const episodeCount = tvDetail?.number_of_episodes ?? 0;
  
  return (
    <div>
      <div className="flex flex-row flex-wrap place-content-center items-center mb-10 mt-5">
        <ImageCard mediaDetail={tvDetail} />
        <TvDetails TvDetail={tvDetail} genreArr={genreArr} SeasonNums={seasonCount} EpisodeNums={episodeCount} />
      </div>

      {/* Only render SeasonDisplay if seasons array has content */}
      {seasons.length > 0 && (
        <div>
          {/* Key forces re-render when TvDetail changes to ensure fresh season data */}
          <SeasonDisplay key={tvDetail?.id} SeasonCards={seasons} TvDetails={tvDetail}/>
        </div>
      )}
    </div>
  );
};

export default TvInfo;
