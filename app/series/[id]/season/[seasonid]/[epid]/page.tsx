import EpisodeInfo from "@/components/info/EpisodeInfo";
import React from "react";

async function getEpisodeDetails(seriesId: string, seasonId: string, episodeId: string) {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error('API key not configured');

    const [episodeRes, seasonRes, seriesRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonId}/episode/${episodeId}?api_key=${apiKey}`),
      fetch(`https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonId}?api_key=${apiKey}`),
      fetch(`https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}`)
    ]);

    if (!episodeRes.ok || !seasonRes.ok || !seriesRes.ok) {
      throw new Error("Failed to fetch data");
    }

    const [episodeData, seasonData, seriesData] = await Promise.all([
      episodeRes.json(),
      seasonRes.json(),
      seriesRes.json()
    ]);

    return { data: episodeData, id: seriesId, seasonData, seriesData };
  } catch (error) {
    console.error('Failed to fetch episode details:', error);
    return { data: null, id: seriesId, seasonData: null, seriesData: null };
  }
}

interface EpisodeDetailsPageProps {
  params: Promise<{
    id: string;
    seasonid: string;
    epid: string;
  }>;
}

const EpisodeDetailsPage: React.FC<EpisodeDetailsPageProps> = async ({ params }) => {
  const { id: seriesId, seasonid: seasonId, epid: episodeId } = await params;
  const { data, id, seasonData, seriesData } = await getEpisodeDetails(seriesId, seasonId, episodeId);

  if (!data || !seasonData || !seriesData) {
    return <div>Episode not found</div>;
  }

  return (
    <EpisodeInfo
      episodeDetails={data}
      seriesId={id}
      seasonData={seasonData}
      seriesData={seriesData}
    />
  );
};

export default EpisodeDetailsPage;
