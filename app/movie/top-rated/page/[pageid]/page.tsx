import MovieDisplay from "@/components/display/MovieDisplay";
import MoviesTitle from "@/components/title/MoviesTitle";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";

// Discriminated union for API result
type MovieFetchResult = 
  | { success: true; movies: TMDBMovie[] }
  | { success: false; error: string };

// Type guard to validate TMDBMovie objects at runtime
function isTMDBMovie(obj: any): obj is TMDBMovie {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.title === 'string' &&
    typeof obj.overview === 'string' &&
    (typeof obj.poster_path === 'string' || obj.poster_path === null) &&
    (typeof obj.backdrop_path === 'string' || obj.backdrop_path === null) &&
    typeof obj.release_date === 'string' &&
    typeof obj.vote_average === 'number' &&
    typeof obj.vote_count === 'number' &&
    Array.isArray(obj.genre_ids) && obj.genre_ids.every((g: any) => typeof g === 'number') &&
    typeof obj.adult === 'boolean' &&
    typeof obj.original_language === 'string' &&
    typeof obj.original_title === 'string' &&
    typeof obj.popularity === 'number' &&
    typeof obj.video === 'boolean'
  );
}

// Validate and filter API response results
function validateMovieResults(data: any): TMDBMovie[] {
  if (!data || typeof data !== 'object' || !Array.isArray(data.results)) {
    throw new Error('Invalid API response structure: results is not an array');
  }

  const validMovies = data.results.filter((item: any) => {
    const isValid = isTMDBMovie(item);
    if (!isValid) {
      console.warn('Invalid movie item filtered out:', { id: item?.id, title: item?.title });
    }
    return isValid;
  });

  return validMovies;
}

async function getTopRatedMovies(page: number): Promise<MovieFetchResult> {
  try {
    const data = await api.getTopRated('movie', page);
    
    // Use runtime validation instead of type assertion
    const validatedMovies = validateMovieResults(data);
    
    if (validatedMovies.length === 0 && data?.results?.length > 0) {
      console.warn('All movie items failed validation');
    }
    
    return { success: true, movies: validatedMovies };
  } catch (error) {
    // Return a descriptive error message instead of swallowing the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to fetch top rated movies:', errorMessage);
    return { success: false, error: `Failed to load top rated movies: ${errorMessage}` };
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
  const result = await getTopRatedMovies(pageid);

  // Handle error case
  if (result.success === false) {
    return (
      <div className="h-auto">
        <MoviesTitle />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Error Loading Movies</h2>
            <p className="text-gray-400 mb-4">{result.error}</p>
            <p className="text-sm text-gray-500">Please try refreshing the page or check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle success case with no movies
  if (result.movies.length === 0) {
    return (
      <div className="h-auto">
        <MoviesTitle />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">No Movies Found</h2>
            <p className="text-gray-400">No top-rated movies available for this page.</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle success case with movies
  return (
    <div className="h-auto">
      <MoviesTitle />
      <MovieDisplay movies={result.movies} pageid={pageid.toString()} category="top-rated" />
    </div>
  );
};

export default TopRatedPage;