import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import { TMDBMovie, TMDBTVShow } from "@/lib/types";
import { api } from "@/lib/api";

async function getHeroSlides(): Promise<(TMDBMovie | TMDBTVShow)[]> {
  try {
    // Try to fetch both movie and TV data with individual error handling
    const [movieResult, tvResult] = await Promise.allSettled([
      api.getPopular('movie', 1),
      api.getPopular('tv', 1)
    ]);

    const movieData = movieResult.status === 'fulfilled' ? movieResult.value.results.slice(0, 4) : [];
    const tvData = tvResult.status === 'fulfilled' ? tvResult.value.results.slice(0, 3) : [];

    // Log any failures for debugging
    if (movieResult.status === 'rejected') {
      console.warn('Failed to fetch popular movies for hero:', movieResult.reason);
    }
    if (tvResult.status === 'rejected') {
      console.warn('Failed to fetch popular TV shows for hero:', tvResult.reason);
    }

    // Combine available data
    const combined = [...movieData, ...tvData];
    
    // If we have no data at all, return some fallback data or empty array
    if (combined.length === 0) {
      console.warn('No hero slides data available, using empty array');
      return [];
    }
    
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
    console.error('Critical error in getHeroSlides:', error);
    return [];
  }
}

export default async function Home() {
  const heroSlides = await getHeroSlides();

  return (
    <div className="app-bg-enhanced mt-16">
      <Hero slides={heroSlides} />
      <div className="relative z-10 pt-8">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            <CategorySection
              title="Popular Movies"
              mediaType="movie"
              category="popular"
              seeAllHref="/movie?category=popular"
            />
            <CategorySection
              title="Top Rated Movies"
              mediaType="movie"
              category="top_rated"
              seeAllHref="/movie?category=top_rated"
            />
            <CategorySection
              title="Now Playing"
              mediaType="movie"
              category="now_playing"
              seeAllHref="/movie?category=now_playing"
            />
            <CategorySection
              title="Upcoming Movies"
              mediaType="movie"
              category="upcoming"
              seeAllHref="/movie?category=upcoming"
            />
            <CategorySection
              title="Popular TV Shows"
              mediaType="tv"
              category="popular"
              seeAllHref="/series?category=popular"
            />
            <CategorySection
              title="Top Rated TV Shows"
              mediaType="tv"
              category="top_rated"
              seeAllHref="/series?category=top_rated"
            />
            <CategorySection
              title="On The Air"
              mediaType="tv"
              category="on_the_air"
              seeAllHref="/series?category=on_the_air"
            />
            <CategorySection
              title="Airing Today"
              mediaType="tv"
              category="airing_today"
              seeAllHref="/series?category=airing_today"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
