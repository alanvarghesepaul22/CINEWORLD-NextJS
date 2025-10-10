import { Metadata } from "next";
import SeasonNotFound from "@/components/not-found/SeasonNotFound";
import SeasonInfo from "@/components/series/SeasonInfo";

export const metadata: Metadata = {
  title: "Season Details | Cineworld",
  description:
    "View detailed information about TV show seasons including episodes, cast, and ratings.",
};
interface SeasonsDetailsPageProps {
  params: Promise<{
    id: string;
    seasonid: string;
  }>;
}

export default async function SeasonsDetailsPage({
  params,
}: SeasonsDetailsPageProps) {
  const { id, seasonid } = await params;

  if (
    isNaN(parseInt(id, 10)) ||
    isNaN(parseInt(seasonid, 10)) ||
    parseInt(id, 10) <= 0 ||
    parseInt(seasonid, 10) < 0
  ) {
    return <SeasonNotFound seasonId={seasonid} />;
  }

  return <SeasonInfo seasonId={seasonid} seriesId={id} />;
}
