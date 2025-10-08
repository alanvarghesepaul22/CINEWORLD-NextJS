import React from "react";
import MediaDetailLayout from "../layout/MediaDetailLayout";
import EpisodeMeta from "./EpisodeMeta";
import MediaPlayer from "./MediaPlayer";
import EpisodeNavigation from "../pagination/EpisodeNavigation";
import DidYouKnowSection from "./DidYouKnowSection";
import { EpisodeSummary } from "@/lib/types";

interface EpisodeInfoProps {
  episodeDetails: {
    season_number: number;
    episode_number: number;
  };
  seriesId: string | number;
  seasonData: {
    episodes: EpisodeSummary[];
  };
  seriesData: {
    number_of_seasons: number;
    name?: string;
  };
}

const EpisodeInfo = (props: EpisodeInfoProps) => {
  const { episodeDetails, seriesId, seasonData, seriesData } = props;
  const TotalEpisodes = seasonData?.episodes?.length ?? 0;
  const TotalSeasons = seriesData?.number_of_seasons ?? 0;

  // Find the full episode details from seasonData.episodes
  const fullEpisodeDetails =
    seasonData?.episodes?.find(
      (ep: EpisodeSummary) =>
        ep.season_number === episodeDetails.season_number &&
        ep.episode_number === episodeDetails.episode_number
    ) ?? {
      ...episodeDetails,
      name: "",
      air_date: "",
      runtime: 0,
      overview: "",
    };

  return (
    <MediaDetailLayout className="mt-20">
      <div className="space-y-8">
        {/* Episode Information */}
        <EpisodeMeta
          seasonNumber={episodeDetails.season_number}
          episodeNumber={episodeDetails.episode_number}
          episodeTitle={fullEpisodeDetails.name}
          airDate={fullEpisodeDetails.air_date}
          runtime={fullEpisodeDetails.runtime}
          overview={fullEpisodeDetails.overview}
          seriesTitle={seriesData?.name}
        />

        {/* Video Player */}
        <MediaPlayer
          seriesId={seriesId}
          seasonNumber={episodeDetails.season_number}
          episodeNumber={episodeDetails.episode_number}
          episodeTitle={fullEpisodeDetails.name}
        />

        {/* Episode Navigation */}
        <EpisodeNavigation
          seriesId={seriesId}
          currentSeason={episodeDetails.season_number}
          currentEpisode={episodeDetails.episode_number}
          totalEpisodes={TotalEpisodes}
          totalSeasons={TotalSeasons}
        />

        {/* Did You Know Section */}
        <DidYouKnowSection
          title={`${seriesData?.name || 'Series'} - S${episodeDetails.season_number}E${episodeDetails.episode_number}`}
          movieData={{
            name: `${seriesData?.name || 'Series'} - S${episodeDetails.season_number}E${episodeDetails.episode_number}`,
            overview: fullEpisodeDetails?.overview || '',
            first_air_date: fullEpisodeDetails?.air_date || ''
          }}
          className="max-w-6xl mx-auto"
        />
      </div>
    </MediaDetailLayout>
  );
};

export default EpisodeInfo;
