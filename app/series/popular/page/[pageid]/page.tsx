import TvDisplay from "@/components/display/TvDisplay";
import TvTitle from "@/components/title/TvTitle";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

async function getPopularTV(page: number): Promise<TMDBTVShow[]> {
  try {
    const data = await api.getPopular('tv', page);
    return data.results as TMDBTVShow[];
  } catch (error) {
    console.error('Failed to fetch popular TV shows:', error);
    return [];
  }
}

interface PopularPageProps {
  params: Promise<{
    pageid: string;
  }>;
}

const PopularPage: React.FC<PopularPageProps> = async ({ params }) => {
  const { pageid: pageidStr } = await params;
  const pageid = Math.max(1, parseInt(pageidStr) || 1);
  const data = await getPopularTV(pageid);

  return (
    <div className="h-auto">
      <TvTitle />
      <TvDisplay series={data} pageid={pageid.toString()} category="popular" />
    </div>
  );
};

export default PopularPage;