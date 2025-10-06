import TvDisplay from "@/components/display/TvDisplay";
import SearchBar from "@/components/searchbar/SearchBar";
import TvTitle from "@/components/title/TvTitle";
import { TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

// Type guard to validate TMDBTVShow objects at runtime
function isTMDBTVShow(obj: any): obj is TMDBTVShow {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.overview === 'string' &&
    (typeof obj.poster_path === 'string' || obj.poster_path === null) &&
    (typeof obj.backdrop_path === 'string' || obj.backdrop_path === null) &&
    typeof obj.first_air_date === 'string' &&
    typeof obj.vote_average === 'number' &&
    typeof obj.vote_count === 'number' &&
    Array.isArray(obj.genre_ids) && obj.genre_ids.every((g: any) => typeof g === 'number') &&
    typeof obj.adult === 'boolean' &&
    Array.isArray(obj.origin_country) && obj.origin_country.every((c: any) => typeof c === 'string') &&
    typeof obj.original_language === 'string' &&
    typeof obj.original_name === 'string' &&
    typeof obj.popularity === 'number'
  );
}

// Validate and filter API response results
function validateTVShowResults(data: any): TMDBTVShow[] {
  if (!data || typeof data !== 'object' || !Array.isArray(data.results)) {
    console.warn('Invalid API response structure: results is not an array');
    return [];
  }

  const validShows = data.results.filter((item: any) => {
    const isValid = isTMDBTVShow(item);
    if (!isValid) {
      console.warn('Invalid TV show item filtered out:', { id: item?.id, name: item?.name });
    }
    return isValid;
  });

  return validShows;
}

async function getTrendingTV(): Promise<TMDBTVShow[]> {
  try {
    const data = await api.getTrending('tv', 'day', 1);
    
    // Use runtime validation instead of type assertion
    const validatedResults = validateTVShowResults(data);
    
    if (validatedResults.length === 0 && data?.results?.length > 0) {
      console.warn('All TV show items failed validation, returning empty array');
    }
    
    return validatedResults;
  } catch (error) {
    // Log only sanitized error message, not the full error object
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to fetch trending TV shows:', errorMessage);
    return [];
  }
}

const Series = async () => {
  const data = await getTrendingTV();
  return (
    <div className="h-auto">
      <TvTitle />
      {/* <SearchBar />
      <HomeFilter /> */}
      <TvDisplay series={data} />
    </div>
  );
};

export default Series;
