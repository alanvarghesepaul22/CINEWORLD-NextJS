import MovieInfo from "@/components/info/MovieInfo";
import { api } from "@/lib/api";
import { TMDBMovieDetail, Genre } from "@/lib/types";

async function getMovieDetails(id: string): Promise<{ data: TMDBMovieDetail | null; genreArr: string[]; id: string }> {
  try {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new Error('Invalid movie ID');
    }
    const data = await api.getDetails('movie', parsedId) as TMDBMovieDetail;
    const genreArr = data.genres?.map((genre: Genre) => genre.name) || [];
    return { data, genreArr, id };
  } catch (error) {
    console.error('Failed to fetch movie details:', error);
    return { data: null, genreArr: [], id };
  }
}

interface MovieDetailProps {
  params: Promise<{
    id: string;
  }>;
}

const MovieDetail: React.FC<MovieDetailProps> = async ({ params }) => {
  const { id: idStr } = await params;
  const { data, genreArr, id } = await getMovieDetails(idStr);

  if (!data) {
    return <div>Movie not found</div>;
  }

  return <MovieInfo MovieDetail={data} genreArr={genreArr} id={id} />;
};

export default MovieDetail;
