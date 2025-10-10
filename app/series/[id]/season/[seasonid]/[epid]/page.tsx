import { Metadata } from "next";
import EpisodeNotFound from "@/components/not-found/EpisodeNotFound";
import EpisodeInfo from "@/components/series/EpisodeInfo";

export const metadata: Metadata = {
  title: "Episode | Cineworld",
  description:
    "Browse all series available on Cineworld. Find trending, top-rated, and new releases.",
};

interface EpisodeDetailsPageProps {
  params: Promise<{
    id: string;
    seasonid: string;
    epid: string;
  }>;
}

export default async function EpisodeDetailsPage({
  params,
}: EpisodeDetailsPageProps) {
  const { id, seasonid, epid } = await params;

  if (
    isNaN(parseInt(id, 10)) ||
    isNaN(parseInt(seasonid, 10)) ||
    isNaN(parseInt(epid, 10)) ||
    parseInt(id, 10) <= 0 ||
    parseInt(seasonid, 10) < 0 ||
    parseInt(epid, 10) < 0
  ) {
    return (
      <EpisodeNotFound seriesId={id} seasonId={seasonid} episodeId={epid} />
    );
  }

  return <EpisodeInfo seriesId={id} seasonId={seasonid} episodeId={epid} />;
}
