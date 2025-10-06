import HomeDisplay from "@/components/display/HomeDisplay";
import SearchBar from "@/components/searchbar/SearchBar";
import Title from "@/components/title/Title";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

async function getTrendingData(page: number): Promise<(TMDBMovie | TMDBTVShow)[]> {
  try {
    const data = await api.getTrending('all', 'day', page);
    return data.results;
  } catch (error) {
    console.error('Failed to fetch trending data:', error);
    // Return empty array for demo
    return [];
  }
}

interface AllTrendingProps {
  params: Promise<{
    pageid: string;
  }>;
}

const AllTrending: React.FC<AllTrendingProps> = async ({ params }) => {
  const { pageid: pageidStr } = await params;
  const pageid = Math.max(1, parseInt(pageidStr) || 1);
  const data = await getTrendingData(pageid);

  return (
    <div className="h-auto">
      <Title />
      {/* <SearchBar />
      <HomeFilter /> */}
      <HomeDisplay movies={data} pageid={pageid.toString()} category="trending" />
    </div>
  );
};

export default AllTrending;
