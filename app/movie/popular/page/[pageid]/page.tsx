import MovieDisplay from "@/components/display/MovieDisplay";
import SearchBar from "@/components/searchbar/SearchBar";
import MoviesTitle from "@/components/title/MoviesTitle";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";

async function getPopularMovies(page: number): Promise<TMDBMovie[]> {
  try {
    const data = await api.getPopular('movie', page);
    return data.results as TMDBMovie[];
  } catch (error) {
    console.error('Failed to fetch popular movies:', error);
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
  const data = await getPopularMovies(pageid);

  return (
    <div className="h-auto">
      <MoviesTitle />
      {/* <SearchBar />
      <HomeFilter /> */}
      <MovieDisplay movies={data} pageid={pageid.toString()} category="popular" />
    </div>
  );
};

export default PopularPage;
