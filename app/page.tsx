import { Metadata } from "next";
import Hero from "@/components/hero/Hero";
import CategorySection from "@/components/info/CategorySection";

export const metadata: Metadata = {
  title: "Home | Cineworld",
  description:
    "Browse all movies and tv shows currently available on Cineworld. Find trending, top-rated, and new releases.",
};

export default async function HomePage() {
  return (
    <div className="app-bg-enhanced mt-16">
      <Hero />
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
