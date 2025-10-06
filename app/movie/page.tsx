import MovieDisplay from "@/components/display/MovieDisplay";
import SearchDisplay from "@/components/display/SearchDisplay";
import SearchBar from "@/components/searchbar/SearchBar";
import MoviesTitle from "@/components/title/MoviesTitle";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";

async function getPopularMovies(): Promise<TMDBMovie[]> {
  try {
    const data = await api.getPopular('movie', 1);
    
    if (data && Array.isArray(data.results)) {
      return data.results as TMDBMovie[];
    }
    
    console.warn('API returned invalid data structure:', data);
    return [];
  } catch (error) {
    console.error('Failed to fetch popular movies:', error);
    return [];
  }
}

const Movies = async () => {
  const moviedata = await getPopularMovies();

  return (
    <div className="h-auto">
      <MoviesTitle />
      {/* <SearchBar />
      <HomeFilter /> */}
      <MovieDisplay movies={moviedata} />
    </div>
  );
};

export default Movies;
