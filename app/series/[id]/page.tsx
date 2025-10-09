import { Metadata } from "next";
import InfoNotFound from "@/components/not-found/InfoNotFound";
import TvInfo from "@/components/info/TvInfo";

export const metadata: Metadata = {
  title: "Series | Cineworld",
  description:
    "Browse all series available on Cineworld. Find trending, top-rated, and new releases.",
};

interface SeriesDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SeriesDetailsPage({
  params,
}: SeriesDetailsPageProps) {
  const { id } = await params;
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    return <InfoNotFound type="tv" />;
  }

  return <TvInfo id={parsedId} />;
}
