// app/page.js
import HorizontalSection from "@/components/display/HorizontalSection";
import Title from "@/components/title/Title";

async function getSection(url) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3${url}?api_key=${apiKey}&language=en-US`
  );
  const data = await res.json();
  return data.results;
}

export default async function Home() {
  const [trendingMovies, trendingSeries, newReleases] = await Promise.all([
    getSection("/trending/movie/week"),
    getSection("/trending/tv/week"),
    getSection("/movie/now_playing"),
  ]);

  return (
    <div className="h-auto">
      <Title />
      <HorizontalSection
        title="Trending Movies"
        movies={trendingMovies}
        type="movie"
        link="/trending/movie"
      />
      <HorizontalSection
        title="Trending Series"
        movies={trendingSeries}
        type="tv"
        link="/trending/tv"
      />
      <HorizontalSection
        title="New Releases"
        movies={newReleases}
        type="movie"
      />
    </div>
  );
}
