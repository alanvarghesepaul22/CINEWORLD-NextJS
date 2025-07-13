import SectionRow from "@/components/display/SectionRow";
import Title from "@/components/title/Title";

async function getSection(url) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3${url}?api_key=${apiKey}&language=en-US`);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.results;
}

export default async function Home() {
  const [trendingMovies, trendingSeries, newReleases] = await Promise.all([
    getSection("/trending/movie/week"),
    getSection("/trending/tv/week"),
    getSection("/movie/now_playing")
  ]);

  return (
    <div className="h-auto">
      <Title />
      <SectionRow title="Trending Movies" movies={trendingMovies} link="/trending/movie" />
      <SectionRow title="Trending Series" movies={trendingSeries} link="/trending/tv" />
      <SectionRow title="New Releases" movies={newReleases} link="/new-releases" />
    </div>
  );
}
