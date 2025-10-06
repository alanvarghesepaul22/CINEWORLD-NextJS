import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

async function getTrendingData(): Promise<(TMDBMovie | TMDBTVShow)[]> {
  try {
    const data = await api.getTrending('all', 'week', 1);
    return data.results;
  } catch (error) {
    console.error('Failed to fetch trending data:', error);
    return [];
  }
}

async function getHeroSlides(): Promise<(TMDBMovie | TMDBTVShow)[]> {
  try {
    const [movieData, tvData] = await Promise.all([
      api.getPopular('movie', 1),
      api.getPopular('tv', 1)
    ]);

    // Get latest 7 items, alternating between movies and TV
    const combined = [...movieData.results.slice(0, 4), ...tvData.results.slice(0, 3)];
    
    // Validate and normalize dates to timestamps
    const getValidTimestamp = (dateStr: string | null | undefined): number => {
      if (!dateStr || dateStr.trim() === '') {
        return Number.NEGATIVE_INFINITY; // Sort invalid dates to end
      }
      const timestamp = Date.parse(dateStr);
      return isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
    };
    
    return combined.sort((a, b) => {
      // Extract candidate date strings
      const dateStringA = 'release_date' in a ? a.release_date : a.first_air_date;
      const dateStringB = 'release_date' in b ? b.release_date : b.first_air_date;
      
      const timestampA = getValidTimestamp(dateStringA);
      const timestampB = getValidTimestamp(dateStringB);
      
      return timestampB - timestampA; // Latest first
    });
  } catch (error) {
    console.error('Failed to fetch hero slides:', error);
    return [];
  }
}

export default async function Home() {
  const [trendingData, heroSlides] = await Promise.all([
    getTrendingData(),
    getHeroSlides()
  ]);

  return (
    <div className="h-auto">
      <Hero slides={heroSlides} />
      <div className="relative z-10 bg-bg-black pt-8">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            <CategorySection
              title="Popular Movies"
              mediaType="movie"
              category="popular"
              seeAllHref="/movie/popular/page/1"
            />
            <CategorySection
              title="Top Rated Movies"
              mediaType="movie"
              category="top_rated"
              seeAllHref="/movie/top-rated/page/1"
            />
            <CategorySection
              title="Now Playing"
              mediaType="movie"
              category="now_playing"
              seeAllHref="/movie/now-playing/page/1"
            />
            <CategorySection
              title="Upcoming Movies"
              mediaType="movie"
              category="upcoming"
              seeAllHref="/movie/upcoming/page/1"
            />
            <CategorySection
              title="Popular TV Shows"
              mediaType="tv"
              category="popular"
              seeAllHref="/series/popular/page/1"
            />
            <CategorySection
              title="Top Rated TV Shows"
              mediaType="tv"
              category="top_rated"
              seeAllHref="/series/top-rated/page/1"
            />
            <CategorySection
              title="On The Air"
              mediaType="tv"
              category="on_the_air"
              seeAllHref="/series/on-the-air/page/1"
            />
            <CategorySection
              title="Airing Today"
              mediaType="tv"
              category="airing_today"
              seeAllHref="/series/airing-today/page/1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
