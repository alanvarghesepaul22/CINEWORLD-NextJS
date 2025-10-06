import MovieDisplay from "@/components/display/MovieDisplay";
import MoviesTitle from "@/components/title/MoviesTitle";
import { TMDBMovie } from "@/lib/types";
import { api } from "@/lib/api";

async function getNowPlayingMovies(page: number): Promise<TMDBMovie[]> {
  try {
    const data = await api.getNowPlaying('movie', page);
    if (!data || !Array.isArray(data.results)) {
      console.error('Invalid API response structure:', data);
      return [];
    }
    return data.results as TMDBMovie[];
  } catch (error) {
    console.error('Failed to fetch now playing movies:', error);
    return [];
  }
}

interface NowPlayingPageProps {
  params: Promise<{
    pageid: string;
  }>;
}

const NowPlayingPage: React.FC<NowPlayingPageProps> = async ({ params }) => {
  const { pageid: pageidStr } = await params;
  const pageid = Math.max(1, parseInt(pageidStr) || 1);
  const data = await getNowPlayingMovies(pageid);

  return (
    <div className="h-auto">
      <MoviesTitle />
      <MovieDisplay movies={data} pageid={pageid.toString()} category="now-playing" />
    </div>
  );
};

export default NowPlayingPage;