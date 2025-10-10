import React from "react";
import MediaDetailLayout from "../layout/MediaDetailLayout";
import EpisodeMeta from "./EpisodeMeta";
import EpisodeNavigation from "../pagination/EpisodeNavigation";
import {
  EpisodeSummary,
  TMDBEpisodeDetail,
  TMDBSeasonDetail,
  TMDBTVDetail,
} from "@/lib/types";
import { api } from "@/lib/api";
import EpisodeNotFound from "../not-found/EpisodeNotFound";
import MediaPlayer from "../display/MediaPlayer";

async function getEpisodeDetails(
  seriesId: string,
  seasonId: string,
  episodeId: string
): Promise<{
  data: TMDBEpisodeDetail | null;
  id: number;
  seasonData: TMDBSeasonDetail | null;
  seriesData: TMDBTVDetail | null;
  error: "NOT_FOUND" | "FETCH_ERROR" | "NETWORK_ERROR" | null;
}> {
  try {
    // Validate IDs are numeric and positive
    const numericSeriesId = parseInt(seriesId, 10);
    const numericSeasonId = parseInt(seasonId, 10);
    const numericEpisodeId = parseInt(episodeId, 10);

    if (
      isNaN(numericSeriesId) ||
      isNaN(numericSeasonId) ||
      isNaN(numericEpisodeId) ||
      numericSeriesId <= 0 ||
      numericSeasonId < 0 ||
      numericEpisodeId <= 0
    ) {
      throw new Error("Invalid ID format - IDs must be positive integers");
    }

    // Make API calls with retry and caching
    const [episodeData, seasonData, seriesData] = await Promise.all([
      api.getEpisodeDetails(numericSeriesId, numericSeasonId, numericEpisodeId),
      api.getSeasonDetails(numericSeriesId, numericSeasonId),
      api.getDetails("tv", numericSeriesId),
    ]);

    console.log(
      `[EpisodeInfo] Successfully received data for series ${numericSeriesId}, season ${numericSeasonId}, episode ${numericEpisodeId}`
    );
    return {
      data: episodeData,
      id: numericSeriesId,
      seasonData,
      seriesData,
      error: null,
    };
  } catch (error) {
    console.error("[EpisodeInfo] Episode fetch error:", error);
    const error_ = error as Error & { code?: string; status?: number };

    // Check if it's a 404 not found error
    if (error_.code === "NOT_FOUND" || error_.status === 404) {
      console.log(
        `[EpisodeInfo] Detected NOT_FOUND error for series ${seriesId}, season ${seasonId}, episode ${episodeId}`
      );
      return {
        data: null,
        id: parseInt(seriesId, 10) || 0,
        seasonData: null,
        seriesData: null,
        error: "NOT_FOUND",
      };
    }

    // Check if it's a network error
    if (error_.code === "NETWORK_ERROR" || error_.status === 0) {
      console.log(
        `[EpisodeInfo] Detected NETWORK_ERROR for series ${seriesId}, season ${seasonId}, episode ${episodeId}`
      );
      return {
        data: null,
        id: parseInt(seriesId, 10) || 0,
        seasonData: null,
        seriesData: null,
        error: "NETWORK_ERROR",
      };
    }

    console.log(
      `[EpisodeInfo] Detected FETCH_ERROR for series ${seriesId}, season ${seasonId}, episode ${episodeId}`
    );
    return {
      data: null,
      id: parseInt(seriesId, 10) || 0,
      seasonData: null,
      seriesData: null,
      error: "FETCH_ERROR",
    };
  }
}

interface EpisodeInfoProps {
  seriesId: string;
  seasonId: string;
  episodeId: string;
}

const EpisodeInfo = async ({
  seriesId,
  seasonId,
  episodeId,
}: EpisodeInfoProps) => {
  const {
    data: episodeDetails,
    seasonData,
    seriesData,
    error,
  } = await getEpisodeDetails(seriesId, seasonId, episodeId);

  // Handle any error or missing data
  if (error || !episodeDetails) {
    return (
      <EpisodeNotFound
        seriesId={seriesId}
        seasonId={seasonId}
        episodeId={episodeId}
      />
    );
  }

  const TotalEpisodes = seasonData?.episodes?.length ?? 0;
  const TotalSeasons = seriesData?.number_of_seasons ?? 0;

  // Find the full episode details from seasonData.episodes
  const fullEpisodeDetails = seasonData?.episodes?.find(
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
    <MediaDetailLayout className="mt-16">
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

        <MediaPlayer
          mediaId={seriesId}
          title={fullEpisodeDetails.name}
          type="tv"
          season={episodeDetails.season_number}
          episode={episodeDetails.episode_number}
        />

        {/* Episode Navigation */}
        <EpisodeNavigation
          seriesId={seriesId}
          currentSeason={episodeDetails.season_number}
          currentEpisode={episodeDetails.episode_number}
          totalEpisodes={TotalEpisodes}
          totalSeasons={TotalSeasons}
        />
      </div>
    </MediaDetailLayout>
  );
};

export default EpisodeInfo;
