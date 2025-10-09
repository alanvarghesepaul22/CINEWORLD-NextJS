import { api } from "@/lib/api";
import SeasonNotFound from "../not-found/SeasonNotFound";
import ImageCard from "../display/ImageCard";
import SeasonDetails from "./SeasonDetails";
import EpisodeDisplay from "../display/EpisodeDisplay";

async function getSeasonDetails(seriesId: string, seasonId: string) {
  try {
    // Validate IDs are numeric and positive
    const numericSeriesId = parseInt(seriesId, 10);
    const numericSeasonId = parseInt(seasonId, 10);

    if (
      isNaN(numericSeriesId) ||
      isNaN(numericSeasonId) ||
      numericSeriesId <= 0 ||
      numericSeasonId < 0
    ) {
      throw new Error("Invalid ID format - IDs must be positive integers");
    }

    const data = await api.getSeasonDetails(numericSeriesId, numericSeasonId);
    console.log(
      `[SeasonInfo] Successfully received data for series ${numericSeriesId}, season ${numericSeasonId}`
    );
    return { data, id: seriesId, error: null };
  } catch (error) {
    console.error("[SeasonInfo] Season fetch error:", error);
    const error_ = error as Error & { code?: string; status?: number };

    // Check if it's a 404 not found error
    if (error_.code === "NOT_FOUND" || error_.status === 404) {
      console.log(
        `[SeasonInfo] Detected NOT_FOUND error for series ${seriesId}, season ${seasonId}`
      );
      return { data: null, id: seriesId, error: "NOT_FOUND" };
    }

    // Check if it's a network error
    if (error_.code === "NETWORK_ERROR" || error_.status === 0) {
      console.log(
        `[SeasonInfo] Detected NETWORK_ERROR for series ${seriesId}, season ${seasonId}`
      );
      return { data: null, id: seriesId, error: "NETWORK_ERROR" };
    }

    console.log(
      `[SeasonInfo] Detected FETCH_ERROR for series ${seriesId}, season ${seasonId}`
    );
    return { data: null, id: seriesId, error: "FETCH_ERROR" };
  }
}

const SeasonInfo = async ({
  seasonId,
  seriesId,
}: {
  seasonId: string;
  seriesId: string;
}) => {
  const {
    data: SeasonInfos,
    id,
    error,
  } = await getSeasonDetails(seriesId, seasonId);

  // Handle any error or null data
  if (error || !SeasonInfos) {
    return <SeasonNotFound seasonId={seasonId} />;
  }

  const episodes = SeasonInfos.episodes || [];

  return (
    <div className="container mx-auto p-4 my-16">
      <div className="flex flex-row flex-wrap place-content-center items-center mb-10 mt-5">
        <ImageCard mediaDetail={SeasonInfos} />
        <SeasonDetails SeasonInfos={SeasonInfos} />
      </div>

      <EpisodeDisplay EpisodeInfos={episodes} seriesId={id} />
    </div>
  );
};

export default SeasonInfo;
