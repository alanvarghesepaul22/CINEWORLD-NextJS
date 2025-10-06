import SeasonInfo from "@/components/info/SeasonInfo";
import React from "react";

async function getSeasonDetails(seriesId: string, seasonId: string) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error('API key not configured');

    const resp = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonId}?api_key=${apiKey}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) }
    );

    if (!resp.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await resp.json();

    return { data, id: seriesId };
  } catch (error) {
    console.error('Failed to fetch season details:', error);
    return { data: null, id: seriesId };
  }
}

interface SeasonsDetailsPageProps {
  params: Promise<{
    id: string;
    seasonid: string;
  }>;
}

const SeasonsDetailsPage: React.FC<SeasonsDetailsPageProps> = async ({ params }) => {
  const { id: seriesId, seasonid: seasonId } = await params;
  const { data, id } = await getSeasonDetails(seriesId, seasonId);

  if (!data) {
    return <div>Season not found</div>;
  }

  return <SeasonInfo SeasonInfos={data} id={id} />;
};

export default SeasonsDetailsPage;
