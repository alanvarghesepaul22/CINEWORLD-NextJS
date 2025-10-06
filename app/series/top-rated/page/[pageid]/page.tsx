import TvDisplay from "@/components/display/TvDisplay";
import TvTitle from "@/components/title/TvTitle";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

async function getTopRatedTV(page: number): Promise<TMDBTVShow[]> {
  try {
    const data = await api.getTopRated('tv', page);
    return data.results as TMDBTVShow[];
  } catch (error) {
    console.error('Failed to fetch top rated TV shows:', error);
    return [];
  }
}

interface TopRatedPageProps {
  params: Promise<{
    pageid: string;
  }>;
}

const TopRatedPage: React.FC<TopRatedPageProps> = async ({ params }) => {
  const { pageid: pageidStr } = await params;
  const pageid = Math.max(1, parseInt(pageidStr) || 1);
  const data = await getTopRatedTV(pageid);

  return (
    <div className="h-auto">
      <TvTitle />
      <TvDisplay series={data} pageid={pageid.toString()} category="top-rated" />
    </div>
  );
};

export default TopRatedPage;